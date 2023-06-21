import { ChatGPTAPIOptions } from 'chatgpt';
import { execSync } from 'child_process';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

import { HermesTypeEnum, IUserOptions, ReadTypeEnum } from './types';

export const OPENAI_API_KEY_NAME = 'OPENAI_API_KEY';
export const OPENAI_SESSION_TOKEN_NAME = 'OPENAI_SESSION_TOKEN';

export const OPENAI_MAX_RETRY = 3;
export const OPENAI_MAX_CONTINUES = 5;

const DEFAULT_MODELS = {
  apiModel: 'gpt-3.5-turbo',
  proxyModel: 'text-davinci-002-render-sha',
};

export const ROOT_SRC_DIR_PATH = __dirname;

class UserOptionsClass {
  options: IUserOptions;

  private userOptionsDefault: IUserOptions = {
    debug: false,
    hermesType: HermesTypeEnum.Review,
    openAIModel: '',
    openAIProxyUrl: 'https://bypass.churchless.tech/api/conversation',
    openAIMaxTokens: 4096,
    readType: ReadTypeEnum.GitStage,
    readGitStatus: 'R, M, A',
    readFilesRootName: 'src',
    readFileExtensions: '.ts,.tsx',
    testFileType: 'test',
    testFileDirName: '__test__',
    reviewReportWebhook: '',
    translate: 'zh,en',
  };

  get hermesType(): HermesTypeEnum {
    if (!this.options.hermesType) throw new Error('hermesType is not set');
    return this.options.hermesType;
  }

  private getOpenAIKeyFromNpmConfig(key: string): string {
    try {
      return execSync(`npm config get ${key}`).toString().trim();
    } catch (error) {
      return '';
    }
  }

  get openAIKey(): string {
    if (!this.options.openAIKey) {
      this.options.openAIKey =
        this.getOpenAIKeyFromNpmConfig(OPENAI_API_KEY_NAME);
    }

    if (!this.options.openAIKey) throw new Error('openAIKey is not set');

    if (process.env.DEBUG)
      console.log(`openAI key: "${this.options.openAIKey}"`);

    return this.options.openAIKey;
  }

  get openAISessionToken(): string {
    if (!this.options.openAISessionToken) {
      this.options.openAISessionToken = this.getOpenAIKeyFromNpmConfig(
        OPENAI_SESSION_TOKEN_NAME,
      );
    }

    return this.options.openAISessionToken;
  }

  get openAISendByProxy(): boolean {
    return (
      this.options.openAIProxyUrl &&
      this.openAISessionToken &&
      this.openAISessionToken !== 'undefined'
    );
  }

  get openAIModel(): string {
    if (this.openAISendByProxy) {
      if (this.options.openAIModel === DEFAULT_MODELS.apiModel) {
        console.warn(
          '[ 🧙 hermes ] openAIModel is set to gpt-3.5-turbo, but use proxy type, so openAIModel is set to text-davinci-002-render-sha',
        );
        return (this.options.openAIModel = DEFAULT_MODELS.proxyModel);
      }

      return this.options.openAIModel || DEFAULT_MODELS.proxyModel;
    }
    return this.options.openAIModel || DEFAULT_MODELS.apiModel;
  }

  get openAIOptions(): ChatGPTAPIOptions['completionParams'] {
    if (!this.openAIModel) throw new Error('openAIModel is not set');

    return {
      temperature: 0,
      top_p: 0.4,
      stop: ['###'],
      model: this.openAIModel,
      max_tokens: this.options.openAIMaxTokens,
    };
  }

  get readFilesRoot(): string {
    if (!this.options.readFilesRootName)
      throw new Error('readFilesRootName is not set');
    return path.join(process.cwd(), this.options.readFilesRootName);
  }

  get readFilesExtensions(): string[] {
    if (!this.options.readFileExtensions)
      throw new Error('readFileExtensions is not set');
    return this.options.readFileExtensions.split(',');
  }

  get readFileType(): ReadTypeEnum {
    if (!this.options.readType) throw new Error('readType is not set');
    return this.options.readType;
  }

  get openAIPrompt(): string {
    const { openAIPrompt } = this.options;

    if (!openAIPrompt) return '';

    const filePaths = openAIPrompt.split(',');

    const filesContent = filePaths
      .filter(
        (filePath) => fs.existsSync(filePath) && fs.statSync(filePath).isFile(),
      )
      .map((filePath) => fs.readFileSync(filePath.trim(), 'utf-8'))
      .join('\n');

    return filesContent
      ? `Note here is context that you need understand: ${filesContent}.`
      : openAIPrompt;
  }

  private convertProcessEnvToUserOptions(
    processEnv: NodeJS.ProcessEnv,
  ): IUserOptions {
    return {
      debug: process.env.DEBUG === 'true',
      securityRegex: process.env.SECURITY_REGEX || '',
      openAIKey: processEnv.OPENAI_API_KEY,
      openAISessionToken: processEnv.OPENAI_SESSION_TOKEN,
      openAIProxyUrl:
        processEnv.OPENAI_PROXY_URL || this.userOptionsDefault.openAIProxyUrl,
      openAIModel:
        processEnv.OPENAI_MODEL || this.userOptionsDefault.openAIModel,
      openAIMaxTokens: Number(
        processEnv.OPENAI_MAX_TOKENS || this.userOptionsDefault.openAIMaxTokens,
      ),
      /**
       * Read file options
       */
      readType:
        (processEnv.READ_TYPE as ReadTypeEnum) ||
        this.userOptionsDefault.readType,
      readGitStatus:
        processEnv.READ_GIT_STATUS || this.userOptionsDefault.readGitStatus,
      readFilesRootName:
        processEnv.READ_FILES_ROOT_NAME ||
        this.userOptionsDefault.readFilesRootName,
      readFileExtensions:
        processEnv.READ_FILE_EXTENSIONS ||
        this.userOptionsDefault.readFileExtensions,
      /**
       * Test file options
       */
      testFileType:
        processEnv.TEST_FILE_TYPE || this.userOptionsDefault.testFileType,
      testFileDirName:
        processEnv.TEST_FILE_DIR_NAME ||
        this.userOptionsDefault.testFileDirName,
      /**
       * Review options
       */
      reviewReportWebhook: processEnv.REVIEW_REPORT_WEBHOOK,
      /**
       * Translate options
       */
      translate: processEnv.TRANSLATE || this.userOptionsDefault.translate,
    };
  }

  public securityPrompt(prompt: string): string {
    if (!this.options.securityRegex) return prompt;

    const regex = new RegExp(this.options.securityRegex, 'gi');

    return prompt.replace(regex, 'REMOVED');
  }

  public init(userOptions: IUserOptions = {}) {
    config();
    config({ path: path.join(process.cwd(), '.env.local') });
    const envUserOptions = this.convertProcessEnvToUserOptions(process.env);

    if (process.env.DEBUG) {
      console.log('envUserOptions: ', envUserOptions);
      console.log('userOptions: ', userOptions);
    }

    this.options = Object.assign(
      {},
      this.userOptionsDefault,
      envUserOptions,
      userOptions,
    );
  }
}

export const userOptions = new UserOptionsClass();

export const codeBlocksRegex = /```([\s\S]*?)```/g;

export const codeBlocksMdSymbolRegex = /```(\w?)*/g;

export const reviewFileName = '.hermes_review.md';
