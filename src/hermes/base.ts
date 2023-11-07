import { ChatgptProxyAPI } from 'src/utilities/opeai-talker';
import { IReadFileResult } from 'src/utilities/types';

abstract class HermesBase {
  public openai: ChatgptProxyAPI;

  constructor() {
    this.openai = new ChatgptProxyAPI();
  }

  abstract run(fileResult: IReadFileResult): Promise<string | string[]>;
}

export default HermesBase;
