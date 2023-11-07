import { codeBlocksRegex } from 'src/utilities/constant';
import { getAllCodeBlock } from 'src/utilities/modifier/simply-result';
import { IReadFileResult } from 'src/utilities/types';

import HermesBase from './base';

class HermesCreate extends HermesBase {
  public async run(fileResult: IReadFileResult): Promise<string[]> {
    const message = await this.openai.run(fileResult);
    if (!message?.length) return [];
    if (!codeBlocksRegex.test(message.join(''))) return [];

    const extractTestsCode = message.map((m) => getAllCodeBlock(m));

    return extractTestsCode;
  }
}

export default HermesCreate;
