import fs from 'fs';
import path from 'path';
import { userOptions } from 'src/utilities/constant';
import { makeDirExist } from 'src/utilities/helpers';
import { getAllCodeBlock } from 'src/utilities/modifier/simply-result';
import { IReadFileResult } from 'src/utilities/types';
import getConflictResult from 'src/utilities/writer/write-conflict';

import HermesBase from './base';

class HermesTest extends HermesBase {
  private getFileNameWithoutExtension(filePath: string): string {
    return path.basename(filePath, path.extname(filePath));
  }

  private getFileExtension(filePath: string): string {
    return path.extname(filePath);
  }

  private async writeTestMessageToFile(
    { filePath, fileContent }: IReadFileResult,
    message: string,
  ): Promise<void> {
    try {
      const testFileDirName = userOptions.options.testFileDirName;
      if (!testFileDirName) throw new Error('testFileDirName is not set');

      const dirPath = path.join(path.dirname(filePath), testFileDirName);
      const fileName = `${this.getFileNameWithoutExtension(filePath)}.${
        userOptions.options.testFileType
      }${this.getFileExtension(filePath)}`;
      const testFilePath = path.join(dirPath, fileName);

      makeDirExist(dirPath);

      if (!fs.existsSync(testFilePath)) {
        return fs.writeFileSync(testFilePath, message);
      }

      const sourceFileContent = fs.readFileSync(filePath, 'utf-8');
      if (fileContent !== sourceFileContent) {
        const testFileContent = fs.readFileSync(testFilePath, 'utf-8');
        return fs.writeFileSync(
          testFilePath,
          `${testFileContent}\n${message}\n`,
        );
      }

      return fs.writeFileSync(
        testFilePath,
        getConflictResult(fileContent, message),
      );
    } catch (error) {
      console.error('Error writing message to file:', error);
    }
  }

  public async run(fileResult: IReadFileResult): Promise<string> {
    this.openai.resetParentMessage();
    const message = await this.openai.run(fileResult);
    if (!message?.length) return;

    const extractTestsCode = message
      .map((m) => getAllCodeBlock(m))
      .join('\n\n');
    await this.writeTestMessageToFile(fileResult, extractTestsCode);

    return extractTestsCode;
  }
}

export default HermesTest;
