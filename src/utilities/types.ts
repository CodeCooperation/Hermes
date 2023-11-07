export enum HermesTypeEnum {
  Test = 'test',
  Review = 'review',
  Create = 'create',
  Translate = 'translate',
  Modify = 'modify',
}

export enum ReadTypeEnum {
  Directory = 'dir',
  GitStage = 'git',
}

export interface IReadFileResult {
  filePath?: string;
  fileContent?: string;
  prompts?: string[];
}

export interface IUserOptions {
  openAISessionToken?: string;
  openAIProxyUrl?: string;
  openAIModel?: string;
  openAIPrompt?: string;
  openAIMaxTokens?: number;
  hermesType?: HermesTypeEnum;
  debug?: boolean;
  securityRegex?: string;
  readType?: ReadTypeEnum;
  readGitStatus?: string;
  readFilesRootName?: string;
  readFileExtensions?: string;
  testFileType?: string;
  testFileDirName?: string;
  reviewReportWebhook?: string;
  translate?: string;
}
