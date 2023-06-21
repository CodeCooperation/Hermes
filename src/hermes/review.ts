import { IReadFileResult } from 'src/utilities/types';
import WebhookNotifier from 'src/utilities/webhook';

import HermesBase from './base';

class HermesReview extends HermesBase {
  private publishChannel: WebhookNotifier;

  constructor() {
    super();
    this.publishChannel = new WebhookNotifier();
  }

  private async postAIMessage(
    filePath: string,
    message: string,
  ): Promise<void> {
    this.publishChannel.addNoticeTask({ filePath, message });
  }

  public async run(fileResult: IReadFileResult): Promise<string> {
    this.openai.resetParentMessage();
    const message = await this.openai.run(fileResult);
    if (!message?.length) return;

    const resMessage = message.join('\n\n---\n\n');
    this.postAIMessage(fileResult.filePath!, resMessage);
    return resMessage;
  }

  public publishNotice(): void {
    this.publishChannel.publishNotice();
  }
}

export default HermesReview;
