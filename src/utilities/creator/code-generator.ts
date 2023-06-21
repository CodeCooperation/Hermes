import fs from 'fs';
import path from 'path';
import { HermesCreate } from 'src/hermes';
import { userOptions } from 'src/utilities/constant';
import { getFileNameToCamelCase, makeDirExist } from 'src/utilities/helpers';
import { readPromptFile } from 'src/utilities/reader/read-prompt-file';
import getConflictResult from 'src/utilities/writer/write-conflict';

import { IOptionCreated, OptionType, OptionTypeExtension } from './constant';

interface IWriteFileOptions {
  fileName: string;
  fileContent: string;
  optionType: OptionType;
  needCreateDir?: boolean;
  rootDirPath?: string;
}

class CreateCodeGenerator {
  private option: OptionType;
  private description: string;
  private dirName: string;
  private name: string;
  private hermes: HermesCreate;

  constructor() {
    this.init();
  }

  private init() {
    this.hermes = new HermesCreate();
  }

  private getPrompts() {
    const { option, description, dirName, name } = this;
    const basePrompts = [
      `${readPromptFile(`create-${option}.txt`)}
            Please note is's modelName is "${dirName}${getFileNameToCamelCase(
        name,
        true,
      )}", and reply "${option}" code by following requirements: ${description}.
          `,
    ];
    if (option === OptionType.Models) {
      basePrompts.push(
        `${readPromptFile(`create-${OptionType.Services}.txt`)}
            Note that you should consider the method name and relationship between the "${
              OptionType.Models
            }" that you reply before.
            Please reply "${
              OptionType.Services
            }" code by following requirements: ${description}.
          `,
      );
      basePrompts.push(
        `${readPromptFile(`create-${OptionType.Mock}.txt`)}
            Note that you should consider the requests api path and relationship between the "${
              OptionType.Services
            }" that you reply before.
            Please reply "${
              OptionType.Mock
            }" code by following requirements: ${description}.
          `,
      );
    }
    return basePrompts;
  }

  private writeFile(options: IWriteFileOptions) {
    const {
      fileName,
      fileContent,
      needCreateDir,
      optionType,
      rootDirPath = '',
    } = options;
    const dirPath =
      rootDirPath ||
      path.join(
        process.cwd(),
        userOptions.options.readFilesRootName,
        optionType,
        needCreateDir ? getFileNameToCamelCase(this.dirName, true) : '',
      );
    makeDirExist(dirPath);
    const filePath = path.join(
      dirPath,
      `${fileName}.${OptionTypeExtension[optionType]}`,
    );

    const existFileContent =
      fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf-8');
    fs.writeFileSync(
      filePath,
      existFileContent
        ? getConflictResult(existFileContent, fileContent)
        : fileContent,
    );
  }

  private handleModelsOption(dirName: string, name: string, message: string[]) {
    const [modelContent, serviceContent, mockContent] = message;
    const fileName = `${dirName}${getFileNameToCamelCase(name, true)}`;
    this.writeFile({
      fileName,
      fileContent: modelContent,
      needCreateDir: false,
      optionType: OptionType.Models,
    });
    this.writeFile({
      fileName,
      fileContent: serviceContent,
      needCreateDir: false,
      optionType: OptionType.Services,
    });
    this.writeFile({
      fileName,
      fileContent: mockContent,
      rootDirPath: path.join(process.cwd(), OptionType.Mock),
      optionType: OptionType.Mock,
    });
  }

  setOptions(options: IOptionCreated) {
    this.option = options.option;
    this.description = options.description;
    this.dirName = options.dirName;
    this.name = options.name;
  }

  async generator() {
    const prompts = this.getPrompts();
    const message = await this.hermes.run({ prompts });
    if (!message.length) return;

    if ([OptionType.Models].includes(this.option)) {
      this.handleModelsOption(this.dirName, this.name, message);
      return;
    }

    let optionType = this.option;
    if ([OptionType.Sections].includes(this.option)) {
      optionType = OptionType.Pages;
    }

    this.writeFile({
      fileName: this.name,
      fileContent: message.join('\n'),
      needCreateDir: true,
      optionType: optionType,
    });
  }
}

export default CreateCodeGenerator;
