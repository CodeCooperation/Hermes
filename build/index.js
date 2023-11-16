// node_modules/tsup/assets/esm_shims.js
import { fileURLToPath } from "url";
import path from "path";
var getFilename = () => fileURLToPath(import.meta.url);
var getDirname = () => path.dirname(getFilename());
var __dirname = /* @__PURE__ */ getDirname();

// src/index.ts
import "isomorphic-fetch";

// src/hermes/test.ts
import fs6 from "fs";
import path4 from "path";

// src/utilities/constant.ts
import { execSync } from "child_process";
import { config } from "dotenv";
import fs from "fs";
import path2 from "path";
var OPENAI_API_KEY_NAME = "OPENAI_API_KEY";
var OPENAI_SESSION_TOKEN_NAME = "OPENAI_SESSION_TOKEN";
var OPENAI_MAX_RETRY = 3;
var OPENAI_MAX_CONTINUES = 5;
var DEFAULT_MODELS = {
  apiModel: "gpt-3.5-turbo",
  proxyModel: "text-davinci-002-render-sha"
};
var ROOT_SRC_DIR_PATH = __dirname;
var UserOptionsClass = class {
  constructor() {
    this.userOptionsDefault = {
      debug: false,
      hermesType: "review" /* Review */,
      openAIModel: "",
      openAIProxyUrl: "https://bypass.churchless.tech/api/conversation",
      openAIMaxTokens: 4096,
      readType: "git" /* GitStage */,
      readGitStatus: "R, M, A",
      readFilesRootName: "src",
      readFileExtensions: ".ts,.tsx",
      testFileType: "test",
      testFileDirName: "__test__",
      reviewReportWebhook: "",
      translate: "zh,en"
    };
  }
  get hermesType() {
    if (!this.options.hermesType)
      throw new Error("hermesType is not set");
    return this.options.hermesType;
  }
  getOpenAIKeyFromNpmConfig(key) {
    try {
      return execSync(`npm config get ${key}`).toString().trim();
    } catch (error) {
      return "";
    }
  }
  get openAIKey() {
    if (!this.options.openAIKey) {
      this.options.openAIKey = this.getOpenAIKeyFromNpmConfig(OPENAI_API_KEY_NAME);
    }
    if (!this.options.openAIKey)
      throw new Error("openAIKey is not set");
    if (process.env.DEBUG)
      console.log(`openAI key: "${this.options.openAIKey}"`);
    return this.options.openAIKey;
  }
  get openAISessionToken() {
    if (!this.options.openAISessionToken) {
      this.options.openAISessionToken = this.getOpenAIKeyFromNpmConfig(
        OPENAI_SESSION_TOKEN_NAME
      );
    }
    return this.options.openAISessionToken;
  }
  get openAISendByProxy() {
    return this.options.openAIProxyUrl && this.openAISessionToken && this.openAISessionToken !== "undefined";
  }
  get openAIModel() {
    if (this.openAISendByProxy) {
      if (this.options.openAIModel === DEFAULT_MODELS.apiModel) {
        console.warn(
          "[ \u{1F9D9} hermes ] openAIModel is set to gpt-3.5-turbo, but use proxy type, so openAIModel is set to text-davinci-002-render-sha"
        );
        return this.options.openAIModel = DEFAULT_MODELS.proxyModel;
      }
      return this.options.openAIModel || DEFAULT_MODELS.proxyModel;
    }
    return this.options.openAIModel || DEFAULT_MODELS.apiModel;
  }
  get openAIOptions() {
    if (!this.openAIModel)
      throw new Error("openAIModel is not set");
    return {
      temperature: 0,
      top_p: 0.4,
      stop: ["###"],
      model: this.openAIModel,
      max_tokens: this.options.openAIMaxTokens
    };
  }
  get readFilesRoot() {
    if (!this.options.readFilesRootName)
      throw new Error("readFilesRootName is not set");
    return path2.join(process.cwd(), this.options.readFilesRootName);
  }
  get readFilesExtensions() {
    if (!this.options.readFileExtensions)
      throw new Error("readFileExtensions is not set");
    return this.options.readFileExtensions.split(",");
  }
  get readFileType() {
    if (!this.options.readType)
      throw new Error("readType is not set");
    return this.options.readType;
  }
  get openAIPrompt() {
    const { openAIPrompt } = this.options;
    if (!openAIPrompt)
      return "";
    const filePaths = openAIPrompt.split(",");
    const filesContent = filePaths.filter(
      (filePath) => fs.existsSync(filePath) && fs.statSync(filePath).isFile()
    ).map((filePath) => fs.readFileSync(filePath.trim(), "utf-8")).join("\n");
    return filesContent ? `Note here is context that you need understand: ${filesContent}.` : openAIPrompt;
  }
  convertProcessEnvToUserOptions(processEnv) {
    return {
      debug: process.env.DEBUG === "true",
      securityRegex: process.env.SECURITY_REGEX || "",
      openAIKey: processEnv.OPENAI_API_KEY,
      openAISessionToken: processEnv.OPENAI_SESSION_TOKEN,
      openAIProxyUrl: processEnv.OPENAI_PROXY_URL || this.userOptionsDefault.openAIProxyUrl,
      openAIModel: processEnv.OPENAI_MODEL || this.userOptionsDefault.openAIModel,
      openAIMaxTokens: Number(
        processEnv.OPENAI_MAX_TOKENS || this.userOptionsDefault.openAIMaxTokens
      ),
      /**
       * Read file options
       */
      readType: processEnv.READ_TYPE || this.userOptionsDefault.readType,
      readGitStatus: processEnv.READ_GIT_STATUS || this.userOptionsDefault.readGitStatus,
      readFilesRootName: processEnv.READ_FILES_ROOT_NAME || this.userOptionsDefault.readFilesRootName,
      readFileExtensions: processEnv.READ_FILE_EXTENSIONS || this.userOptionsDefault.readFileExtensions,
      /**
       * Test file options
       */
      testFileType: processEnv.TEST_FILE_TYPE || this.userOptionsDefault.testFileType,
      testFileDirName: processEnv.TEST_FILE_DIR_NAME || this.userOptionsDefault.testFileDirName,
      /**
       * Review options
       */
      reviewReportWebhook: processEnv.REVIEW_REPORT_WEBHOOK,
      /**
       * Translate options
       */
      translate: processEnv.TRANSLATE || this.userOptionsDefault.translate
    };
  }
  securityPrompt(prompt) {
    if (!this.options.securityRegex)
      return prompt;
    const regex = new RegExp(this.options.securityRegex, "gi");
    return prompt.replace(regex, "REMOVED");
  }
  init(userOptions2 = {}) {
    config();
    config({ path: path2.join(process.cwd(), ".env.local") });
    const envUserOptions = this.convertProcessEnvToUserOptions(process.env);
    if (process.env.DEBUG) {
      console.log("envUserOptions: ", envUserOptions);
      console.log("userOptions: ", userOptions2);
    }
    this.options = Object.assign(
      {},
      this.userOptionsDefault,
      envUserOptions,
      userOptions2
    );
  }
};
var userOptions = new UserOptionsClass();
var codeBlocksRegex = /```([\s\S]*?)```/g;
var codeBlocksMdSymbolRegex = /```(\w?)*/g;
var reviewFileName = ".hermes_review.md";

// src/utilities/helpers.ts
import { execSync as execSync2 } from "child_process";
import fs2 from "fs";

// src/utilities/modifier/simply-result.ts
var replaceCodeBlock = (data, placeholder = `check your local __${reviewFileName}__`) => {
  return data.replace(codeBlocksRegex, placeholder);
};
var getAllCodeBlock = (data) => {
  const codeBlocks = data.match(codeBlocksRegex);
  return codeBlocks ? codeBlocks == null ? void 0 : codeBlocks.map(
    (t) => codeBlocksMdSymbolRegex.test(t) ? t.replace(codeBlocksMdSymbolRegex, "") : t
  ).join("") : data;
};
var simplyReviewData = (data) => {
  return replaceCodeBlock(data).replace(/'/g, "").replace(/`/g, "__").replace(/\n/g, "\\r");
};

// src/utilities/helpers.ts
var getUserEmail = () => {
  const output = execSync2("git config user.email").toString().trim();
  return output;
};
var deleteFileSync = (filePath) => {
  if (!fs2.existsSync(filePath))
    return;
  fs2.unlinkSync(filePath);
};
var makeDirExist = (dirPath) => {
  if (fs2.existsSync(dirPath))
    return;
  fs2.mkdirSync(dirPath, { recursive: true });
};
var getFileNameToCamelCase = (fileName, isFirstUpper = false) => {
  if (!fileName)
    return "";
  if (fileName.indexOf("-") === -1) {
    return isFirstUpper ? fileName.slice(0, 1).toUpperCase() + fileName.slice(1) : fileName.slice(0, 1).toLowerCase() + fileName.slice(1);
  }
  fileName.split("-").map((word, index) => {
    if (index !== 0) {
      return `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`;
    }
    return isFirstUpper ? word.slice(0, 1).toUpperCase() : word.slice(0, 1).toLowerCase();
  }).join("");
};

// src/utilities/writer/write-conflict.ts
function getConflictResult(sourceContent, targetContent) {
  const removeStartAndEndEmptyLine = (content) => {
    const lines = content.split("\n");
    let start = 0;
    let end = lines.length - 1;
    return lines.filter((line, index) => {
      if (line.trim() === "" && index === start) {
        start += 1;
        return false;
      }
      if (line.trim() === "" && index === end) {
        end -= 1;
        return false;
      }
      return true;
    });
  };
  const findFirstNotSameLineNumber = (sourceLines2, targetLines2) => {
    let i = 0;
    for (; i < sourceLines2.length && i < targetLines2.length; i++) {
      if (sourceLines2[i] !== targetLines2[i]) {
        break;
      }
    }
    return i;
  };
  const findReverseSameLinesLength = (sourceLines2, targetLines2) => {
    let i = 0;
    const sourceLinesReverse = sourceLines2.slice().reverse();
    const targetLinesReverse = targetLines2.slice().reverse();
    for (; i < sourceLinesReverse.length && i < targetLinesReverse.length; i++) {
      if (sourceLinesReverse[i] !== targetLinesReverse[i]) {
        break;
      }
    }
    return i;
  };
  const sourceLines = removeStartAndEndEmptyLine(sourceContent);
  const targetLines = removeStartAndEndEmptyLine(targetContent);
  if (sourceLines.join("\n") === targetLines.join("\n")) {
    return sourceContent;
  }
  const firstNotSameLineNumber = findFirstNotSameLineNumber(
    sourceLines,
    targetLines
  );
  const reverseSameLinesLength = findReverseSameLinesLength(
    sourceLines,
    targetLines
  );
  const resultLines = [
    ...sourceLines.slice(0, firstNotSameLineNumber),
    "<<<<<<< HEAD",
    ...sourceLines.slice(
      firstNotSameLineNumber,
      sourceLines.length - reverseSameLinesLength
    ),
    "=======",
    ...targetLines.slice(
      firstNotSameLineNumber,
      targetLines.length - reverseSameLinesLength
    ),
    ">>>>>>> Incoming",
    ...sourceLines.slice(sourceLines.length - reverseSameLinesLength)
  ];
  return resultLines.join("\n");
}
var write_conflict_default = getConflictResult;

// src/utilities/opeai-talker/index.ts
import { AbortController } from "abort-controller";
import chalk from "chalk";
import {
  ChatGPTAPI,
  ChatGPTUnofficialProxyAPI
} from "chatgpt";
import ora from "ora";

// src/utilities/opeai-talker/prompt.ts
import fs5 from "fs";

// src/utilities/reader/read-prompt-file.ts
import fs3 from "fs";
import path3 from "path";
var readPromptFile = (fileName) => {
  const userLocalPath = path3.join(process.cwd(), "prompt", fileName);
  if (fs3.existsSync(userLocalPath)) {
    return fs3.readFileSync(userLocalPath, "utf-8");
  }
  return fs3.readFileSync(
    path3.join(ROOT_SRC_DIR_PATH, "prompt", fileName),
    "utf-8"
  );
};

// src/utilities/extractor/extract-code-prompts.ts
import generate from "@babel/generator";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import fs4 from "fs";
var traverseFunc = typeof traverse === "function" ? traverse : traverse.default;
var generateFunc = typeof generate === "function" ? generate : generate.default;
var ExtractCodePrompts = class {
  constructor() {
    this.remainingCode = [];
    this.remainingEndIndex = 0;
  }
  isFunctionOrClass(nodePath) {
    if (!nodePath)
      return true;
    const isVariableDeclarationFunction = nodePath.isVariableDeclaration() && nodePath.node.declarations.some(
      (d) => d.init && (d.init.type === "FunctionExpression" || d.init.type === "ArrowFunctionExpression")
    );
    return nodePath.isFunction() || nodePath.isClass() || isVariableDeclarationFunction;
  }
  extractFunctionOrClassCodeArray({
    fileContent,
    filePath
  }) {
    var _a;
    try {
      const ast = parse(fileContent, {
        sourceType: "module",
        plugins: ["typescript", "jsx"]
      });
      traverseFunc(ast, {
        enter: (nodePath) => {
          if (Number(nodePath.node.start) < this.remainingEndIndex)
            return;
          if (!this.isFunctionOrClass(nodePath))
            return;
          this.remainingEndIndex = Number(nodePath.node.end);
          const codeSnippet = generateFunc(nodePath.node).code;
          this.remainingCode.push(codeSnippet);
        }
      });
      return this.remainingCode;
    } catch (e) {
      if ((_a = userOptions.options) == null ? void 0 : _a.debug)
        console.error("Babel parse error: ", e);
      return [
        fs4.existsSync(filePath) ? fs4.readFileSync(filePath, "utf-8") : fileContent
      ];
    }
  }
};

// src/utilities/opeai-talker/prompt.ts
var HermesPrompt = class {
  constructor(hermesType) {
    this.hermesType = hermesType;
    this.hermesTypeMap = {
      ["test" /* Test */]: (fileResult) => {
        const fileContent = fileResult.fileContent || fs5.readFileSync(fileResult.filePath, "utf-8");
        const testsPrompt = readPromptFile("tests.txt");
        const basePrompt = `
        ${testsPrompt}
        ${userOptions.openAIPrompt || ""}
      `;
        const codePicker = new ExtractCodePrompts();
        const codePrompts = codePicker.extractFunctionOrClassCodeArray({
          ...fileResult,
          fileContent
        });
        return [basePrompt, ...codePrompts];
      },
      ["review" /* Review */]: (fileResult) => {
        const fileContent = fileResult.fileContent || fs5.readFileSync(fileResult.filePath, "utf-8");
        const reviewPrompt = readPromptFile("review.txt");
        const basePrompt = `
        ${reviewPrompt}
        ${userOptions.openAIPrompt || ""}
      `;
        const codePicker = new ExtractCodePrompts();
        const codePrompts = codePicker.extractFunctionOrClassCodeArray({
          ...fileResult,
          fileContent
        });
        return [basePrompt, ...codePrompts];
      },
      ["translate" /* Translate */]: (fileResult) => {
        const fileContent = fileResult.fileContent || fs5.readFileSync(fileResult.filePath, "utf-8");
        const readPrompt = readPromptFile("translate.txt");
        const basePrompt = `
        ${readPrompt}
        - Target language: ${userOptions.options.translate}
        ${userOptions.openAIPrompt || ""}
      `;
        return [basePrompt, fileContent];
      },
      ["create" /* Create */]: ({ prompts }) => {
        if (!prompts)
          throw new Error("prompts is required for create");
        const createPrompt = readPromptFile("create.txt");
        return [
          createPrompt,
          ...[
            `${userOptions.openAIPrompt}
${prompts.slice(0, 1)}`,
            ...prompts.slice(1)
          ]
        ];
      },
      ["modify" /* Modify */]: ({ prompts }) => {
        const readPrompt = readPromptFile("modify.txt");
        return [
          readPrompt,
          ...[
            `${userOptions.openAIPrompt}
${prompts.slice(0, 1)}`,
            ...prompts.slice(1)
          ]
        ];
      }
    };
  }
  generatePrompt(fileResult) {
    if (!fileResult)
      throw new Error("File path is required for generatePrompt");
    if (!this.hermesTypeMap[this.hermesType])
      throw new Error("Invalid hermesType: " + this.hermesType);
    return this.hermesTypeMap[this.hermesType](fileResult);
  }
};

// src/utilities/opeai-talker/send-message.ts
var sendMessageWithRetry = async (sendMessage, retries = OPENAI_MAX_RETRY, retryDelay = 3e3) => {
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
          `[ \u{1F9D9} hermes ] sendMessage failed, retrying... (${retry + 1}/${retries})`
        );
      }
    }
  }
  throw new Error("sendMessage failed after retries");
};
var handleContinueMessage = async (message, sendMessage, maxContinueAttempts = OPENAI_MAX_CONTINUES) => {
  var _a;
  let resMessage = message;
  let continueAttempts = 0;
  if ((resMessage.text.match(codeBlocksMdSymbolRegex) || []).length % 2 === 0) {
    return resMessage;
  }
  while (continueAttempts < maxContinueAttempts) {
    const continueMessage = "continue";
    const nextMessage = await sendMessage(continueMessage, {
      conversationId: resMessage.conversationId,
      parentMessageId: resMessage.id
    });
    console.log(
      `[ \u{1F9D9} hermes ] continue message... (${continueAttempts + 1}/${maxContinueAttempts})`
    );
    resMessage = {
      ...resMessage,
      ...nextMessage,
      text: `${resMessage.text}${nextMessage.text}`
    };
    if (((_a = nextMessage.text.match(codeBlocksMdSymbolRegex)) == null ? void 0 : _a.length) > 0)
      break;
    continueAttempts++;
  }
  return resMessage;
};

// src/utilities/opeai-talker/index.ts
var ChatgptProxyAPI = class {
  constructor() {
    this.initChatApi();
  }
  get needPrintMsg() {
    return true;
  }
  initChatApi() {
    if (process.env.DEBUG)
      console.log(`openAI session token: "${userOptions.openAISessionToken}"`);
    console.log("[ \u{1F9D9} hermes ] Using Model:", chalk.green(userOptions.openAIModel));
    if (!userOptions.openAISendByProxy) {
      this.chatApi = new ChatGPTAPI({
        apiKey: userOptions.openAIKey,
        completionParams: userOptions.openAIOptions,
        debug: userOptions.options.debug
      });
      return;
    }
    this.chatApi = new ChatGPTUnofficialProxyAPI({
      model: userOptions.openAIModel,
      accessToken: userOptions.openAISessionToken,
      apiReverseProxyUrl: userOptions.options.openAIProxyUrl
    });
  }
  generatePrompt(fileRes) {
    const hermesType = new HermesPrompt(userOptions.hermesType);
    return hermesType.generatePrompt(fileRes);
  }
  isReviewPassed(msg) {
    if (userOptions.hermesType !== "review" /* Review */)
      return true;
    return /perfect!/gi.test(msg);
  }
  oraStart(text = "", needPrintMsg = this.needPrintMsg) {
    if (!needPrintMsg)
      return ora();
    return ora({
      text,
      spinner: {
        interval: 800,
        frames: ["\u{1FA84}", "\u{1F9D9}", "\u{1FA84}", "\u{1F9D9}", "\u{1FA84}", "\u{1F9D9}", "\u{1FA84}", "\u{1F9D9}"]
      }
    }).start();
  }
  async sendPrompt(prompt, prevMsg) {
    const securityPrompt = userOptions.securityPrompt(prompt);
    if (!prevMsg) {
      return await sendMessageWithRetry(
        () => this.chatApi.sendMessage(securityPrompt)
      );
    }
    const reviewSpinner = this.oraStart();
    const controller = new AbortController();
    const signal = controller.signal;
    const sendOptions = {
      ...prevMsg,
      timeoutMs: 1e3 * 60 * 5,
      abortSignal: signal,
      onProgress: (partialResponse) => {
        reviewSpinner.text = partialResponse.text;
      }
    };
    try {
      let resMsg = await sendMessageWithRetry(
        () => this.chatApi.sendMessage(securityPrompt, sendOptions)
      );
      resMsg = await handleContinueMessage(
        resMsg,
        (msg, options) => this.chatApi.sendMessage(msg, { ...sendOptions, ...options })
      );
      const isReviewPassed = this.isReviewPassed(resMsg.text);
      const colorText = isReviewPassed ? chalk.green(resMsg.text) : chalk.yellow(resMsg.text);
      reviewSpinner[isReviewPassed ? "succeed" : "fail"](
        `[ \u{1F9D9} hermes ] ${colorText} 
 `
      );
      return resMsg;
    } catch (error) {
      reviewSpinner.fail(`[ \u{1F9D9} hermes ] ${error.message} 
 `);
      controller.abort();
      throw error;
    }
  }
  async sendFileRes(fileRes) {
    const promptArray = this.generatePrompt(fileRes);
    const [systemPrompt, ...codePrompts] = promptArray;
    if (userOptions.options.debug) {
      console.log("[ \u{1F9D9} hermes ] systemPrompt:", systemPrompt);
      console.log(
        "[ \u{1F9D9} hermes ] codePrompts:",
        codePrompts.length,
        codePrompts
      );
    }
    if (!codePrompts.length)
      return [];
    const msgArray = [];
    let msg = this.parentMsg || await this.sendPrompt(systemPrompt);
    for (const prompt of codePrompts) {
      msg = await this.sendPrompt(prompt, {
        conversationId: msg == null ? void 0 : msg.conversationId,
        parentMessageId: msg == null ? void 0 : msg.id
      });
      msgArray.push(msg.text);
      this.parentMsg = msg;
    }
    return msgArray;
  }
  resetParentMessage() {
    this.parentMsg = void 0;
  }
  async run(fileRes) {
    const reviewSpinner = this.oraStart(
      chalk.cyan(`[ \u{1F9D9} hermes ] start ${userOptions.hermesType} your code... 
`)
    );
    return this.sendFileRes(fileRes).then((res) => {
      reviewSpinner.succeed(
        chalk.green(
          `\u{1F389}\u{1F389} [ \u{1F9D9} hermes ] ${userOptions.hermesType} code successfully! \u{1F389}\u{1F389}
 `
        )
      );
      return res;
    }).catch((error) => {
      console.error("run error:", error);
      reviewSpinner.fail(
        chalk.red(
          `\u{1F914}\u{1F914} [ \u{1F9D9} hermes ] ${userOptions.hermesType} your code failed! \u{1F914}\u{1F914}
`
        )
      );
      return ["[ \u{1F9D9} hermes ] call OpenAI API failed!"];
    }).finally(() => {
      reviewSpinner.stop();
    });
  }
};

// src/hermes/base.ts
var HermesBase = class {
  constructor() {
    this.openai = new ChatgptProxyAPI();
  }
};
var base_default = HermesBase;

// src/hermes/test.ts
var HermesTest = class extends base_default {
  getFileNameWithoutExtension(filePath) {
    return path4.basename(filePath, path4.extname(filePath));
  }
  getFileExtension(filePath) {
    return path4.extname(filePath);
  }
  async writeTestMessageToFile({ filePath, fileContent }, message) {
    try {
      const testFileDirName = userOptions.options.testFileDirName;
      if (!testFileDirName)
        throw new Error("testFileDirName is not set");
      const dirPath = path4.join(path4.dirname(filePath), testFileDirName);
      const fileName = `${this.getFileNameWithoutExtension(filePath)}.${userOptions.options.testFileType}${this.getFileExtension(filePath)}`;
      const testFilePath = path4.join(dirPath, fileName);
      makeDirExist(dirPath);
      if (!fs6.existsSync(testFilePath)) {
        return fs6.writeFileSync(testFilePath, message);
      }
      const sourceFileContent = fs6.readFileSync(filePath, "utf-8");
      if (fileContent !== sourceFileContent) {
        const testFileContent = fs6.readFileSync(testFilePath, "utf-8");
        return fs6.writeFileSync(
          testFilePath,
          `${testFileContent}
${message}
`
        );
      }
      return fs6.writeFileSync(
        testFilePath,
        write_conflict_default(fileContent, message)
      );
    } catch (error) {
      console.error("Error writing message to file:", error);
    }
  }
  async run(fileResult) {
    this.openai.resetParentMessage();
    const message = await this.openai.run(fileResult);
    if (!(message == null ? void 0 : message.length))
      return;
    const extractTestsCode = message.map((m) => getAllCodeBlock(m)).join("\n\n");
    await this.writeTestMessageToFile(fileResult, extractTestsCode);
    return extractTestsCode;
  }
};
var test_default = HermesTest;

// src/utilities/webhook/index.ts
import { exec } from "child_process";
import fs7 from "fs";
import path5 from "path";
var WebhookNotifier = class {
  constructor({
    channel = userOptions.options.reviewReportWebhook,
    userEmail = ""
  } = {}) {
    this.tasks = [];
    if (!channel)
      return;
    this.userEmail = userEmail;
    this.channel = channel;
  }
  /**
   * Add a notice task
   */
  addNoticeTask(task) {
    if (!task)
      return;
    this.tasks.push(
      `__${path5.dirname(task.filePath).split("/").pop()}/${path5.basename(
        task.filePath
      )}__ \\r\u2022 ${task.message}`
    );
  }
  /**
   * Publish all notices to the webhook channel
   */
  async publishNotice() {
    var _a;
    if (!((_a = this.tasks) == null ? void 0 : _a.length))
      return;
    const content = this.tasks.join("\\r\\r\\n");
    const reviewFilePath = `${path5.join(process.cwd(), reviewFileName)}`;
    deleteFileSync(reviewFilePath);
    if (codeBlocksRegex.test(content)) {
      fs7.writeFileSync(reviewFilePath, content, "utf-8");
    }
    if (userOptions.options.debug) {
      console.log(
        "publishNotice: channel=%s, content=%s",
        this.channel,
        content
      );
    }
    if (!this.channel)
      return;
    const data = `<mention-tag target=\\"seatalk://user?email=${this.userEmail || getUserEmail()}\\" />\\r\\r${simplyReviewData(content)}`;
    try {
      await exec(
        `curl -i -X POST -H 'Content-Type: application/json' -d '{ "tag": "markdown", "markdown": {"content": "${data}"}}' ${this.channel}`
      );
    } catch (error) {
      console.error(error);
    }
  }
};
var webhook_default = WebhookNotifier;

// src/hermes/review.ts
var HermesReview = class extends base_default {
  constructor() {
    super();
    this.publishChannel = new webhook_default();
  }
  async postAIMessage(filePath, message) {
    this.publishChannel.addNoticeTask({ filePath, message });
  }
  async run(fileResult) {
    this.openai.resetParentMessage();
    const message = await this.openai.run(fileResult);
    if (!(message == null ? void 0 : message.length))
      return;
    const resMessage = message.join("\n\n---\n\n");
    this.postAIMessage(fileResult.filePath, resMessage);
    return resMessage;
  }
  publishNotice() {
    this.publishChannel.publishNotice();
  }
};
var review_default = HermesReview;

// src/hermes/create.ts
var HermesCreate = class extends base_default {
  async run(fileResult) {
    const message = await this.openai.run(fileResult);
    if (!(message == null ? void 0 : message.length))
      return [];
    if (!codeBlocksRegex.test(message.join("")))
      return [];
    const extractTestsCode = message.map((m) => getAllCodeBlock(m));
    return extractTestsCode;
  }
};
var create_default = HermesCreate;

// src/hermes/modify.ts
var HermesModify = class extends base_default {
  async run(fileResult) {
    const message = await this.openai.run(fileResult);
    if (!(message == null ? void 0 : message.length))
      return [];
    if (!codeBlocksRegex.test(message.join("")))
      return [];
    const extractTestsCode = message.map((m) => getAllCodeBlock(m));
    return extractTestsCode;
  }
};
var modify_default = HermesModify;

// src/hermes/translate.ts
import fs8 from "fs";
var HermesTranslate = class extends base_default {
  writeMessageToFile({ filePath, fileContent }, message) {
    try {
      if (userOptions.options.debug) {
        console.log("Write message to file:", filePath, message);
      }
      fs8.writeFileSync(filePath, write_conflict_default(fileContent, message));
    } catch (error) {
      console.error("Error writing message to file:", error);
    }
  }
  async run(fileResult) {
    this.openai.resetParentMessage();
    const message = await this.openai.run(fileResult);
    if (!(message == null ? void 0 : message.length))
      return;
    const extractCode = message.map((m) => getAllCodeBlock(m)).join("\n");
    this.writeMessageToFile(fileResult, extractCode);
    return extractCode;
  }
};
var translate_default = HermesTranslate;

// src/utilities/creator/index.ts
import inquirer from "inquirer";
import ora2 from "ora";

// src/utilities/creator/code-generator.ts
import fs9 from "fs";
import path6 from "path";

// src/utilities/creator/constant.ts
var OptionTypeExtension = {
  ["components" /* Components */]: "tsx",
  ["pages" /* Pages */]: "tsx",
  ["sections" /* Sections */]: "tsx",
  ["models" /* Models */]: "ts",
  ["services" /* Services */]: "ts",
  ["mock" /* Mock */]: "ts"
};
var optionShortcuts = {
  ["models" /* Models */]: "1",
  ["sections" /* Sections */]: "2",
  ["pages" /* Pages */]: "3",
  ["components" /* Components */]: "4"
};
var messages = {
  selectOption: "Select an option:",
  enterDirectoryName: "Enter a name for module (Directory Name):",
  enterName: (option) => `Enter a name for the ${option}:`,
  nameEmpty: "Name cannot be empty.",
  enterDescription: (option) => `Enter a description for the ${option}:`,
  descriptionEmpty: "Description cannot be empty.",
  continueOrFinish: "Do you want to continue or finish?"
};

// src/utilities/creator/code-generator.ts
var CreateCodeGenerator = class {
  constructor() {
    this.init();
  }
  init() {
    this.hermes = new create_default();
  }
  getPrompts() {
    const { option, description, dirName, name } = this;
    const basePrompts = [
      `${readPromptFile(`create-${option}.txt`)}
            Please note is's modelName is "${dirName}${getFileNameToCamelCase(
        name,
        true
      )}", and reply "${option}" code by following requirements: ${description}.
          `
    ];
    if (option === "models" /* Models */) {
      basePrompts.push(
        `${readPromptFile(`create-${"services" /* Services */}.txt`)}
            Note that you should consider the method name and relationship between the "${"models" /* Models */}" that you reply before.
            Please reply "${"services" /* Services */}" code by following requirements: ${description}.
          `
      );
      basePrompts.push(
        `${readPromptFile(`create-${"mock" /* Mock */}.txt`)}
            Note that you should consider the requests api path and relationship between the "${"services" /* Services */}" that you reply before.
            Please reply "${"mock" /* Mock */}" code by following requirements: ${description}.
          `
      );
    }
    return basePrompts;
  }
  writeFile(options) {
    const {
      fileName,
      fileContent,
      needCreateDir,
      optionType,
      rootDirPath = ""
    } = options;
    const dirPath = rootDirPath || path6.join(
      process.cwd(),
      userOptions.options.readFilesRootName,
      optionType,
      needCreateDir ? getFileNameToCamelCase(this.dirName, true) : ""
    );
    makeDirExist(dirPath);
    const filePath = path6.join(
      dirPath,
      `${fileName}.${OptionTypeExtension[optionType]}`
    );
    const existFileContent = fs9.existsSync(filePath) && fs9.readFileSync(filePath, "utf-8");
    fs9.writeFileSync(
      filePath,
      existFileContent ? write_conflict_default(existFileContent, fileContent) : fileContent
    );
  }
  handleModelsOption(dirName, name, message) {
    const [modelContent, serviceContent, mockContent] = message;
    const fileName = `${dirName}${getFileNameToCamelCase(name, true)}`;
    this.writeFile({
      fileName,
      fileContent: modelContent,
      needCreateDir: false,
      optionType: "models" /* Models */
    });
    this.writeFile({
      fileName,
      fileContent: serviceContent,
      needCreateDir: false,
      optionType: "services" /* Services */
    });
    this.writeFile({
      fileName,
      fileContent: mockContent,
      rootDirPath: path6.join(process.cwd(), "mock" /* Mock */),
      optionType: "mock" /* Mock */
    });
  }
  setOptions(options) {
    this.option = options.option;
    this.description = options.description;
    this.dirName = options.dirName;
    this.name = options.name;
  }
  async generator() {
    const prompts = this.getPrompts();
    const message = await this.hermes.run({ prompts });
    if (!message.length)
      return;
    if (["models" /* Models */].includes(this.option)) {
      this.handleModelsOption(this.dirName, this.name, message);
      return;
    }
    let optionType = this.option;
    if (["sections" /* Sections */].includes(this.option)) {
      optionType = "pages" /* Pages */;
    }
    this.writeFile({
      fileName: this.name,
      fileContent: message.join("\n"),
      needCreateDir: true,
      optionType
    });
  }
};
var code_generator_default = CreateCodeGenerator;

// src/utilities/creator/index.ts
var CreateCLI = class {
  constructor() {
    this.init();
  }
  init() {
    this.codeGenerator = new code_generator_default();
  }
  /**
   * Prompt option selection from user
   */
  async promptOptionSelection() {
    const { option } = await inquirer.prompt([
      {
        type: "list",
        name: "option",
        message: messages.selectOption,
        choices: [
          "models" /* Models */,
          "sections" /* Sections */,
          "pages" /* Pages */,
          "components" /* Components */
        ].map((option2) => ({
          name: `${option2} (${optionShortcuts[option2]})`,
          value: option2
        }))
      }
    ]);
    return option;
  }
  /**
   * Prompt name from user
   */
  async promptName(option, defaultName) {
    const { name } = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        default: defaultName || option ? "index" : "exampleModule",
        message: option ? messages.enterName(option) : messages.enterDirectoryName,
        validate: (input) => {
          if (input.trim() === "")
            return messages.nameEmpty;
          if (!/^[a-z]+(?:[A-Z][a-z]*)*$/.test(input))
            return "Name must be in camelCase.";
          return true;
        }
      }
    ]);
    return name;
  }
  /**
   * Prompt description from user
   */
  async promptOptionDescription(option) {
    const { description } = await inquirer.prompt([
      {
        type: "input",
        name: "description",
        default: `Please input your requirements`,
        message: messages.enterDescription(option),
        validate: (input) => input.trim() !== "" || messages.descriptionEmpty
      }
    ]);
    return description;
  }
  /**
   * Prompt continue or finish from user
   */
  async promptContinueOrFinish() {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: messages.continueOrFinish,
        choices: ["Continue", "Finish"]
      }
    ]);
    return action === "Continue";
  }
  /**
   * Start CLI
   */
  async start() {
    let continuePrompt = true;
    let dirName;
    while (continuePrompt) {
      const selectedOption = await this.promptOptionSelection();
      dirName = await this.promptName(void 0, dirName);
      const name = await this.promptName(selectedOption);
      const description = await this.promptOptionDescription(selectedOption);
      const spinner = ora2("[ \u{1F9D9} hermes ] Processing...").start();
      this.codeGenerator.setOptions({
        option: selectedOption,
        name,
        dirName,
        description
      });
      await this.codeGenerator.generator();
      spinner.stop();
      continuePrompt = await this.promptContinueOrFinish();
    }
  }
};
var creator_default = CreateCLI;

// src/utilities/modifier/index.ts
import fs10 from "fs";
import inquirer2 from "inquirer";
import ora3 from "ora";
var ModifyCLI = class {
  constructor(readFileResult) {
    this.readFileResult = readFileResult;
    this.init();
  }
  init() {
    this.hermes = new modify_default();
  }
  async promptOptionDescription() {
    const { description } = await inquirer2.prompt([
      {
        type: "input",
        name: "description",
        default: `Please fix bugs or optimize my code, and extract constant variable or enum variable. if the function is complexity, please chunk it. If it's functional component, use react hooks optimize some UI component or functions. And add comments with ${userOptions.options.translate || "en"} language for complexity logic steps.`,
        messages: `Please input your modify requirements`,
        validate: (input) => input.trim() !== "" || "Description cannot be empty."
      }
    ]);
    return description;
  }
  async promptContinueOrFinish() {
    const { action } = await inquirer2.prompt([
      {
        type: "list",
        name: "action",
        message: "Do you want to continue or finish?",
        choices: ["Continue", "Finish"]
      }
    ]);
    return action === "Continue";
  }
  writeFile(filePath, newContent) {
    fs10.writeFileSync(
      filePath,
      write_conflict_default(fs10.readFileSync(filePath, "utf-8"), newContent)
    );
  }
  async runSingleFile(fileResult, continueTimes) {
    if (!(fileResult == null ? void 0 : fileResult.filePath))
      throw new Error("File path is empty");
    console.log(`[ \u{1F9D9} hermes ] Start modify ${fileResult.filePath}...`);
    const description = await this.promptOptionDescription();
    const spinner = ora3(`[ \u{1F9D9} hermes ] Processing...`).start();
    const prompts = [
      continueTimes === 0 ? `My fileContent is: ${fileResult.fileContent}.` : "",
      `Please modify previous code by following requirements: ${description}`
    ];
    const message = await this.hermes.run({
      ...this.readFileResult,
      prompts: [prompts.join("\n")]
    });
    if (!(message == null ? void 0 : message.length)) {
      spinner.stop();
      return;
    }
    this.writeFile(fileResult.filePath, message.join("\n"));
    spinner.stop();
  }
  async start() {
    var _a;
    if (!((_a = this.readFileResult) == null ? void 0 : _a.length))
      throw new Error("File path is empty");
    let continuePrompt = true;
    let continueTimes = 0;
    while (continuePrompt) {
      for (const fileResult of this.readFileResult) {
        await this.runSingleFile(fileResult, continueTimes);
      }
      continuePrompt = await this.promptContinueOrFinish();
      continueTimes += 1;
    }
  }
};
var modifier_default = ModifyCLI;

// src/utilities/reader/index.ts
import ora4 from "ora";
import path9 from "path";

// src/utilities/reader/reader-directory.ts
import fs11 from "fs";
import path7 from "path";
var ReadTestFilePathsByDirectory = class {
  getFilesInDirectory(dirPath) {
    return fs11.readdirSync(dirPath);
  }
  isDirectory(filePath) {
    return fs11.statSync(filePath).isDirectory();
  }
  getSubDirectoryFilePaths(filePath) {
    return this.getDirFiles(filePath);
  }
  getFileContent(filePath) {
    return fs11.readFileSync(filePath, "utf-8");
  }
  getDirFiles(dirPath) {
    if (!this.isDirectory(dirPath)) {
      return [{ filePath: dirPath, fileContent: this.getFileContent(dirPath) }];
    }
    const filesPath = this.getFilesInDirectory(dirPath);
    return filesPath.reduce((fileResult, file) => {
      const filePath = path7.join(dirPath, file);
      if (this.isDirectory(filePath)) {
        const subDirFileResults = this.getSubDirectoryFilePaths(filePath);
        return [...fileResult, ...subDirFileResults];
      }
      return [
        ...fileResult,
        { filePath, fileContent: this.getFileContent(filePath) }
      ];
    }, []);
  }
};
var reader_directory_default = ReadTestFilePathsByDirectory;

// src/utilities/reader/reader-git-stage.ts
import { execSync as execSync4 } from "child_process";
import fs12 from "fs";
import path8 from "path";

// src/utilities/extractor/extract-modify-funcs.ts
import { execSync as execSync3 } from "child_process";
var GitDiffExtractor = class {
  getGitDiffOutput(filePath) {
    return execSync3(`git diff --cached ${filePath}`).toString();
  }
  getModifiedLineNumbers(diffLines) {
    const modifiedLineNumbers = [];
    let currentLineNumber = 0;
    for (const line of diffLines) {
      if (line.startsWith("@@ ")) {
        const match = line.match(/\+(\d+)/);
        if (match) {
          currentLineNumber = parseInt(match[1], 10) - 1;
        }
      } else if (line.startsWith("+") && !line.startsWith("++") && !line.startsWith("@@")) {
        modifiedLineNumbers.push(currentLineNumber);
        currentLineNumber++;
      } else if (!line.startsWith("-")) {
        currentLineNumber++;
      }
    }
    return modifiedLineNumbers;
  }
  extractCodeBlock(lines, lineNumber) {
    let startLine = lineNumber;
    let endLine = lineNumber;
    const blockPattern = /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\b|class\b|.*=>|\(.*\)\s*=>|\(\s*\)\s*=>)/;
    const classPattern = /^\s*(?:export\s+)?(?:default\s+)?class\b/;
    while (startLine >= 0 && !lines[startLine].match(blockPattern)) {
      startLine--;
    }
    if (lines[startLine] && lines[startLine].match(classPattern)) {
      endLine = this.findClosingBrace(lines, startLine);
    } else {
      let openBraces = 0;
      for (let i = startLine; i < lines.length; i++) {
        const line = lines[i];
        openBraces += this.countChar(line, "{");
        openBraces -= this.countChar(line, "}");
        if (openBraces === 0) {
          endLine = i;
          break;
        }
      }
    }
    if (startLine < 0 || endLine >= lines.length || !lines[startLine]) {
      return null;
    }
    return lines.slice(startLine, endLine + 1).join("\n");
  }
  findClosingBrace(lines, startLine) {
    let openBraces = 0;
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      openBraces += this.countChar(line, "{");
      openBraces -= this.countChar(line, "}");
      if (openBraces === 0) {
        return i;
      }
    }
    return lines.length - 1;
  }
  countChar(line, char) {
    return (line == null ? void 0 : line.split(char).length) - 1 || 0;
  }
  isCodeBlockContainedInExistingBlocks(codeBlock, existingBlocks) {
    for (const existingBlock of existingBlocks) {
      if (existingBlock.includes(codeBlock)) {
        return true;
      }
    }
    return false;
  }
  addCodeBlockIfNotContained(blocks, newBlock) {
    if (!this.isCodeBlockContainedInExistingBlocks(newBlock, blocks) && !blocks.includes(newBlock)) {
      blocks.push(newBlock);
    }
  }
  extractModifiedFunction(filePath, contents) {
    const diffOutput = this.getGitDiffOutput(filePath);
    const diffLines = diffOutput == null ? void 0 : diffOutput.split("\n");
    if (!diffLines || !contents)
      return null;
    const modifiedLineNumbers = this.getModifiedLineNumbers(diffLines);
    if (modifiedLineNumbers.length === 0)
      return null;
    const lines = contents.split("\n");
    const extractedCodeBlocks = [];
    for (const lineNumber of modifiedLineNumbers) {
      const codeBlock = this.extractCodeBlock(lines, lineNumber);
      if (codeBlock) {
        this.addCodeBlockIfNotContained(extractedCodeBlocks, codeBlock);
      }
    }
    return extractedCodeBlocks.join("\n\n");
  }
};
var extract_modify_funcs_default = GitDiffExtractor;

// src/utilities/reader/reader-git-stage.ts
var StagedFileReader = class {
  constructor() {
    this.stagedFiles = this.readStagedFiles();
  }
  readStagedFiles() {
    var _a;
    const files = execSync4("git diff --cached --name-status").toString().split("\n").filter(Boolean);
    const readRootName = userOptions.options.readFilesRootName;
    const readGitStatus = ((_a = userOptions.options.readGitStatus) == null ? void 0 : _a.split(",").map((el) => el.trim())) || [];
    if (!readRootName)
      throw new Error("readFilesRootName is not set");
    if (!readGitStatus.length) {
      console.warn("readGitStatus is not set, no reading staged files");
      return [];
    }
    return files.reduce((acc, file) => {
      const fileSplitArr = file.split("	");
      const status = fileSplitArr[0].slice(0, 1);
      const filePath = fileSplitArr.slice(-1)[0];
      const fullPath = path8.join(process.cwd(), filePath);
      if (!readGitStatus.includes(status) || !filePath.startsWith(`${readRootName}/`) || !fs12.existsSync(fullPath)) {
        return acc;
      }
      const contents = fs12.readFileSync(fullPath, "utf-8");
      if (status !== "M") {
        return [...acc, { filePath: fullPath, fileContent: contents }];
      }
      const codeExtractor = new extract_modify_funcs_default();
      const modifiedContents = codeExtractor.extractModifiedFunction(fullPath, contents) || "";
      return [
        ...acc,
        {
          filePath: fullPath,
          fileContent: modifiedContents
        }
      ];
    }, []);
  }
  getStagedFiles() {
    return this.stagedFiles;
  }
};
var reader_git_stage_default = StagedFileReader;

// src/utilities/reader/index.ts
var ReadFiles = class {
  constructor({
    dirPath = userOptions.readFilesRoot,
    fileExtensions = userOptions.readFilesExtensions
  } = {}) {
    this.readTypeMap = {
      ["dir" /* Directory */]: () => this.getTestFilePathByDir(),
      ["git" /* GitStage */]: () => this.getTestFilePathByGit()
    };
    this.dirPath = dirPath;
    this.fileExtensions = fileExtensions;
  }
  getTestFilePathByDir() {
    const reader = new reader_directory_default();
    return reader.getDirFiles(this.dirPath);
  }
  getTestFilePathByGit() {
    const reader = new reader_git_stage_default();
    return reader.getStagedFiles();
  }
  hasValidExtension(file) {
    const extension = path9.extname(file);
    if (!this.fileExtensions.length)
      return true;
    return this.fileExtensions.some(
      (ext) => ext === extension || ext === extension.slice(1)
    );
  }
  isTestFile(file) {
    const extension = path9.extname(file);
    const testFileType = userOptions.options.testFileType;
    return file.endsWith(`.${testFileType}${extension}`);
  }
  getFileResults(readFileType = userOptions.readFileType) {
    if (!this.readTypeMap[readFileType])
      throw new Error("Invalid test file read type");
    const readSpinner = ora4({
      text: "\u{1FA84} [ \u{1F9D9} hermes ] Reading files..."
    }).start();
    try {
      const fileResults = this.readTypeMap[readFileType]().filter(
        ({ filePath: path10 }) => path10 && this.hasValidExtension(path10) && !this.isTestFile(path10)
      );
      if (userOptions.options.debug) {
        console.log(
          "[ \u{1F9D9} hermes ] read files ===>",
          fileResults.map((r) => r.filePath)
        );
      }
      fileResults.length > 0 ? readSpinner.succeed(
        "\u{1F31F}\u{1F31F} [ \u{1F9D9} hermes ] read files successfully! \u{1F31F}\u{1F31F}"
      ) : readSpinner.warn("\u{1F914}\u{1F914} [ \u{1F9D9} hermes ] read no files! \u{1F914}\u{1F914}");
      return fileResults;
    } catch (error) {
      readSpinner.fail(`[ \u{1F9D9} hermes ] read files failed: ${error}`);
      throw error;
    }
  }
};
var reader_default = ReadFiles;

// src/index.ts
var runMap = {
  ["test" /* Test */]: async () => {
    const testFilePaths = new reader_default();
    const files = testFilePaths.getFileResults();
    const hermes = new test_default();
    for (const fileResult of files) {
      await hermes.run(fileResult);
    }
  },
  ["review" /* Review */]: async () => {
    const reviewFiles = new reader_default();
    const files = reviewFiles.getFileResults();
    const hermes = new review_default();
    for (const fileResult of files) {
      await hermes.run(fileResult);
    }
    hermes.publishNotice();
  },
  ["create" /* Create */]: async () => {
    const cli = new creator_default();
    await cli.start();
  },
  ["modify" /* Modify */]: async () => {
    const reviewFiles = new reader_default();
    const files = reviewFiles.getFileResults();
    if (!files.length)
      return;
    const cli = new modifier_default(files);
    await cli.start();
  },
  ["translate" /* Translate */]: async () => {
    const testFilePaths = new reader_default({ fileExtensions: [] });
    const files = testFilePaths.getFileResults("dir" /* Directory */);
    const hermes = new translate_default();
    for (const fileResult of files) {
      await hermes.run(fileResult);
    }
  }
};
function main(options) {
  userOptions.init(options);
  const type = userOptions.hermesType;
  if (!runMap[type])
    throw new Error("Invalid hermesType: " + type);
  if (userOptions.options.debug) {
    console.log(
      "Running hermes with options: ",
      JSON.stringify(userOptions.options)
    );
  }
  runMap[type]();
}
var src_default = main;
export {
  src_default as default,
  main
};
//# sourceMappingURL=index.js.map
