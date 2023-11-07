import fs from 'fs';
import { userOptions } from 'src/utilities/constant';
import { readPromptFile } from 'src/utilities/reader/read-prompt-file';

import { ExtractCodePrompts } from '../extractor/extract-code-prompts';
import { HermesTypeEnum, IReadFileResult } from '../types';

export class HermesPrompt {
  private hermesTypeMap: Record<
    HermesTypeEnum,
    (fileResult: IReadFileResult) => string[]
  > = {
    [HermesTypeEnum.Test]: (fileResult) => {
      const fileContent =
        fileResult.fileContent ||
        fs.readFileSync(fileResult.filePath!, 'utf-8');
      const testsPrompt = readPromptFile('tests.txt');
      const basePrompt = `
        ${testsPrompt}
        ${userOptions.openAIPrompt || ''}
      `;

      const codePicker = new ExtractCodePrompts();

      const codePrompts = codePicker.extractFunctionOrClassCodeArray({
        ...fileResult,
        fileContent,
      });

      return [basePrompt, ...codePrompts];
    },
    [HermesTypeEnum.Review]: (fileResult) => {
      const fileContent =
        fileResult.fileContent ||
        fs.readFileSync(fileResult.filePath!, 'utf-8');
      const reviewPrompt = readPromptFile('review.txt');
      const basePrompt = `
        ${reviewPrompt}
        ${userOptions.openAIPrompt || ''}
      `;

      const codePicker = new ExtractCodePrompts();

      const codePrompts = codePicker.extractFunctionOrClassCodeArray({
        ...fileResult,
        fileContent,
      });

      return [basePrompt, ...codePrompts];
    },
    [HermesTypeEnum.Translate]: (fileResult) => {
      const fileContent =
        fileResult.fileContent ||
        fs.readFileSync(fileResult.filePath!, 'utf-8');
      const readPrompt = readPromptFile('translate.txt');
      const basePrompt = `
        ${readPrompt}
        - Target language: ${userOptions.options.translate}
        ${userOptions.openAIPrompt || ''}
      `;

      return [basePrompt, fileContent];
    },
    [HermesTypeEnum.Create]: ({ prompts }) => {
      if (!prompts) throw new Error('prompts is required for create');
      const createPrompt = readPromptFile('create.txt');

      return [
        createPrompt,
        ...[
          `${userOptions.openAIPrompt}\n${prompts.slice(0, 1)}`,
          ...prompts.slice(1),
        ],
      ];
    },
    [HermesTypeEnum.Modify]: ({ prompts }) => {
      const readPrompt = readPromptFile('modify.txt');

      return [
        readPrompt,
        ...[
          `${userOptions.openAIPrompt}\n${prompts.slice(0, 1)}`,
          ...prompts.slice(1),
        ],
      ];
    },
  };

  constructor(private hermesType: HermesTypeEnum) {}

  public generatePrompt(fileResult: IReadFileResult): string[] {
    if (!fileResult)
      throw new Error('File path is required for generatePrompt');
    if (!this.hermesTypeMap[this.hermesType])
      throw new Error('Invalid hermesType: ' + this.hermesType);

    return this.hermesTypeMap[this.hermesType](fileResult);
  }
}
