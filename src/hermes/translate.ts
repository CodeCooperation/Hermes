import fs from 'fs';
import { userOptions } from 'src/utilities/constant';
import { getAllCodeBlock } from 'src/utilities/modifier/simply-result';
import { IReadFileResult } from 'src/utilities/types';
import getConflictResult from 'src/utilities/writer/write-conflict';

import HermesBase from './base';

class HermesTranslate extends HermesBase {
  private writeMessageToFile(
    { filePath, fileContent }: IReadFileResult,
    message: string,
  ) {
    try {
      if (userOptions.options.debug) {
        console.log('Write message to file:', filePath, message);
      }
      fs.writeFileSync(filePath, getConflictResult(fileContent, message));
    } catch (error) {
      console.error('Error writing message to file:', error);
    }
  }

  public async run(fileResult: IReadFileResult): Promise<string> {
    this.openai.resetParentMessage();
    const message = await this.openai.run(fileResult);
    if (!message?.length) return;

    const extractCode = message.map((m) => getAllCodeBlock(m)).join('\n');
    this.writeMessageToFile(fileResult, extractCode);

    return extractCode;
  }
}

export default HermesTranslate;
