import { ChatMessage, SendMessageOptions } from 'chatgpt';
import {
  OPENAI_MAX_CONTINUES,
  OPENAI_MAX_RETRY,
  codeBlocksMdSymbolRegex,
} from 'src/utilities/constant';

export const sendMessageWithRetry = async (
  sendMessage: () => Promise<ChatMessage>,
  retries = OPENAI_MAX_RETRY,
  retryDelay = 3000,
): Promise<ChatMessage> => {
  for (let retry = 0; retry < retries; retry++) {
    try {
      const res = await sendMessage();
      return res;
    } catch (error) {
      if (error.statusCode === 401) {
        throw error;
      } else if (error.statusCode === 429) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        if (retry === retries) {
          throw error;
        }
        console.log(
          `[ 🧙 hermes ] sendMessage failed, retrying... (${
            retry + 1
          }/${retries})`,
        );
      }
    }
  }
  throw new Error('sendMessage failed after retries');
};

export const handleContinueMessage = async (
  message: ChatMessage,
  sendMessage: (
    messageText: string,
    sendOptions?: SendMessageOptions,
  ) => Promise<ChatMessage>,
  maxContinueAttempts = OPENAI_MAX_CONTINUES,
): Promise<ChatMessage> => {
  let resMessage = message;
  let continueAttempts = 0;

  if ((resMessage.text.match(codeBlocksMdSymbolRegex) || []).length % 2 === 0) {
    return resMessage;
  }

  while (continueAttempts < maxContinueAttempts) {
    const continueMessage = 'continue';
    const nextMessage = await sendMessage(continueMessage, {
      conversationId: resMessage.conversationId,
      parentMessageId: resMessage.id,
    } as SendMessageOptions);

    console.log(
      `[ 🧙 hermes ] continue message... (${
        continueAttempts + 1
      }/${maxContinueAttempts})`,
    );

    resMessage = {
      ...resMessage,
      ...nextMessage,
      text: `${resMessage.text}${nextMessage.text}`,
    };

    if (nextMessage.text.match(codeBlocksMdSymbolRegex)?.length > 0) break;

    continueAttempts++;
  }
  return resMessage;
};
