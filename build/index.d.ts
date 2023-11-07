declare enum HermesTypeEnum {
    Test = "test",
    Review = "review",
    Create = "create",
    Translate = "translate",
    Modify = "modify"
}
declare enum ReadTypeEnum {
    Directory = "dir",
    GitStage = "git"
}
interface IUserOptions {
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

declare function main(options?: IUserOptions): void;

export { main as default, main };
