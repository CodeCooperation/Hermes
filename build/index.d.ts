/**
 * The run mode of the hermes
 * test - Run the test file generation
 * review - Run the review file generation
 */
declare enum HermesTypeEnum {
    Test = "test",
    Review = "review",
    Create = "create",
    Translate = "translate",
    Modify = "modify"
}
/**
 * The file extensions to search for
 * @enum {string}
 * @property {string} Directory - Read test files from directory
 * @property {string} GitStage - Read test files from git stage
 * @readonly
 * @type {ReadTypeEnum}
 * @default 'dir'
 */
declare enum ReadTypeEnum {
    Directory = "dir",
    GitStage = "git"
}
interface IUserOptions {
    /**
     * OpenAI options
     * @see https://platform.openai.com/account/api-keys
     */
    /**
     * @name openAIKey
     */
    openAIKey?: string;
    /**
     * @name openAISessionToken
     * @description OpenAI session token, 2 setp to get token, If you don't set this, will use OPENAI_API_KEY, will cause fee by api key
     * @description 1. visit https://chat.openai.com/chat and login
     * @description 2. Visit https://chat.openai.com/api/auth/session to get token
     */
    openAISessionToken?: string;
    openAIProxyUrl?: string;
    openAIModel?: string;
    openAIPrompt?: string;
    openAIMaxTokens?: number;
    /**
     * Hermes options
     */
    hermesType?: HermesTypeEnum;
    debug?: boolean;
    securityRegex?: string;
    /**
     * Read files options
     */
    readType?: ReadTypeEnum;
    readGitStatus?: string;
    readFilesRootName?: string;
    readFileExtensions?: string;
    /**
     * Hermes test options
     */
    testFileType?: string;
    testFileDirName?: string;
    /**
     * Hermes review options
     */
    reviewReportWebhook?: string;
    /**
     * Hermes translate options
     */
    translate?: string;
}

/**
 * Main function for hermes
 */
declare function main(options?: IUserOptions): void;

export { main as default, main };
