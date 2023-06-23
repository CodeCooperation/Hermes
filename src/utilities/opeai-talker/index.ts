import { AbortController } from 'abort-controller';
import chalk from 'chalk';
import {
  ChatGPTAPI,
  ChatGPTUnofficialProxyAPI,
  ChatMessage,
  SendMessageOptions,
} from 'chatgpt';
import ora from 'ora';
import { userOptions as options } from 'src/utilities/constant';
import { HermesPrompt } from 'src/utilities/opeai-talker/prompt';

import { HermesTypeEnum, IReadFileResult } from '../types';
import { handleContinueMessage, sendMessageWithRetry } from './send-message';

export class ChatgptProxyAPI {
  private chatApi: ChatGPTUnofficialProxyAPI | ChatGPTAPI;
  private parentMsg?: ChatMessage;

  constructor() {
    this.initChatApi();
  }

  get needPrintMsg(): boolean {
    return true;
  }

  private initChatApi() {
    if (process.env.DEBUG)
      console.log(`openAI session token: "${options.openAISessionToken}"`);

    console.log('[ 🧙 hermes ] Using Model:', chalk.green(options.openAIModel));
    if (!options.openAISendByProxy) {
      this.chatApi = new ChatGPTAPI({
        apiKey: options.openAIKey,
        completionParams: options.openAIOptions,
        debug: options.options.debug,
      });
      return;
    }

    this.chatApi = new ChatGPTUnofficialProxyAPI({
      model: options.openAIModel,
      accessToken: options.openAISessionToken,
      apiReverseProxyUrl: options.options.openAIProxyUrl,
    });
  }

  private generatePrompt(fileRes: IReadFileResult): string[] {
    const hermesType = new HermesPrompt(options.hermesType);

    return hermesType.generatePrompt(fileRes);
  }

  private isReviewPassed(msg: string): boolean {
    if (options.hermesType !== HermesTypeEnum.Review) return true;
    return /perfect!/gi.test(msg);
  }

  private oraStart(text = '', needPrintMsg = this.needPrintMsg): ora.Ora {
    if (!needPrintMsg) return ora();

    return ora({
      text,
      spinner: {
        interval: 800,
        frames: ['🪄', '🧙', '🪄', '🧙', '🪄', '🧙', '🪄', '🧙'],
      },
    }).start();
  }

  private async sendPrompt(
    prompt: string,
    prevMsg?: Partial<ChatMessage>,
  ): Promise<ChatMessage> {
    const securityPrompt = options.securityPrompt(prompt);

    if (!prevMsg) {
      return await sendMessageWithRetry(() =>
        this.chatApi.sendMessage(securityPrompt),
      );
    }

    const reviewSpinner = this.oraStart();
    const controller = new AbortController();
    const signal = controller.signal;
    const sendOptions: SendMessageOptions = {
      ...prevMsg,
      timeoutMs: 1000 * 60 * 5,
      abortSignal: signal,
      onProgress: (partialResponse) => {
        reviewSpinner.text = partialResponse.text;
      },
    };

    try {
      let resMsg = await sendMessageWithRetry(() =>
        this.chatApi.sendMessage(securityPrompt, sendOptions),
      );

      resMsg = await handleContinueMessage(resMsg, (msg, options) =>
        this.chatApi.sendMessage(msg, { ...sendOptions, ...options }),
      );

      const isReviewPassed = this.isReviewPassed(resMsg.text);
      const colorText = isReviewPassed
        ? chalk.green(resMsg.text)
        : chalk.yellow(resMsg.text);

      reviewSpinner[isReviewPassed ? 'succeed' : 'fail'](
        `[ 🧙 hermes ] ${colorText} \n `,
      );

      return resMsg;
    } catch (error) {
      reviewSpinner.fail(`[ 🧙 hermes ] ${error.message} \n `);
      controller.abort();
      throw error;
    }
  }

  async sendFileRes(fileRes: IReadFileResult): Promise<string[]> {
    const promptArray = this.generatePrompt(fileRes);
    const [systemPrompt, ...codePrompts] = promptArray;
    if (options.options.debug) {
      console.log('[ 🧙 hermes ] systemPrompt:', systemPrompt);
      console.log(
        '[ 🧙 hermes ] codePrompts:',
        codePrompts.length,
        codePrompts,
      );
    }
    if (!codePrompts.length) return [];

    const msgArray: string[] = [];
    let msg = this.parentMsg || (await this.sendPrompt(systemPrompt));

    for (const prompt of codePrompts) {
      msg = await this.sendPrompt(prompt, {
        conversationId: msg?.conversationId,
        parentMessageId: msg?.id,
      });
      msgArray.push(msg.text);
      this.parentMsg = msg;
    }

    return msgArray;
  }

  public resetParentMsg() {
    this.parentMsg = undefined;
  }
  async run(fileRes: IReadFileResult): Promise<string[]> {
    const reviewSpinner = this.oraStart(
      chalk.cyan(`[ 🧙 hermes ] start ${options.hermesType} your code... \n`),
    );

    return this.sendFileRes(fileRes)
      .then((res) => {
        reviewSpinner.succeed(
          chalk.green(
            `🎉🎉 [ 🧙 hermes ] ${options.hermesType} code successfully! 🎉🎉\n `,
          ),
        );
        return res;
      })
      .catch((error) => {
        console.error('run error:', error);
        reviewSpinner.fail(
          chalk.red(
            `🤔🤔 [ 🧙 hermes ] ${options.hermesType} your code failed! 🤔🤔\n`,
          ),
        );
        return ['[ 🧙 hermes ] call OpenAI API failed!'];
      })
      .finally(() => {
        reviewSpinner.stop();
      });
  }
}
