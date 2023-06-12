import { ChatgptProxyAPI } from 'src/chatgpt';
import { IReadFileResult } from 'src/types';

/**
 * Base class for Hermes
 */
abstract class HermesBase {
  public openai: ChatgptProxyAPI;

  constructor() {
    // Create a new OpenAI API client
    this.openai = new ChatgptProxyAPI();
  }

  abstract run(fileResult: IReadFileResult): Promise<string | string[]>;
}

export default HermesBase;
