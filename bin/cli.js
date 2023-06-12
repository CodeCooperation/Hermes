#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { main } from '../build/index.js';

const dirname = fileURLToPath(new URL('.', import.meta.url));
const packageJson = JSON.parse(
  fs.readFileSync(path.join(dirname, '..', 'package.json'), 'utf8')
);

const runTypes = ['test', 'review', 'translate', 'create', 'modify'];

const program = new Command();

program
  .version(packageJson.version, '-v, --version', 'output the current version')
  .description('Summon the magical powers of chatgpt 4 to generate code, unit tests or review your code. 🧙‍♂️')
  .argument('<runType>', `Choose your magic spell: ${runTypes.join(', ')}`)
  .option('-k, --api-key <key>', 'Set the OpenAI API key and unlock the full potential of your magic.')
  .option(
    '-t, --openai-session-token <token>',
    "OpenAI session token, 2 step to get token, If you don't set this, will use OPENAI_API_KEY, will cause fee by api key. 🔒"
  )
  .option('-pu, --openai-proxy-url <url>', 'Proxy URL to use for OpenAI API requests. 🌐')
  .option('-m, --model <model>', 'Choose your wand, I mean model, to use. 🪄')
  .option('-p, --prompt <prompt>', 'Speak the magic words and choose your prompt wisely. 🗣️')
  .option('-mt, --max-tokens <tokens>', 'Set the maximum number of tokens to use in your spells. ⚡')
  .option('-e, --file-extensions <extensions>', 'Select the file extensions to read. Example: .ts,.tsx 📁')
  .option('-r, --read-type <type>', 'Read files from directory or git stage. Choose your path wisely. 🛣️')
  .option('-s, --read-git-status <name>', 'Read files from git stage by status default: A,R,M. 👀')
  .option('-d, --read-dir-name <name>', 'Root name of the directory to read files from. Choose your starting point carefully. 🌳')
  .option('-f, --test-file-type <type>', 'Choose the type of test file to generate. Example: test or spec. 🧪')
  .option('-n, --test-file-dir-name <name>', 'Choose the name of the directory to store your tests. Example: __tests__ 📂')
  .option('-w, --review-report-webhook <url>', 'Webhook URL to send review report. Send owls with caution. 🦉')
  .option('-trans, --translate <languages>', 'Translate the code to other languages. Speak in tongues. 🗣️')

  .action((runType, { apiKey, reviewTyping, ...options }) => {
    switch (runType) {
      case 'test':
      case 'review':
      case 'translate':
      case 'create':
      case 'modify': {
        const userOptions = {
          hermesType: runType,
          reviewTyping,
          ...(apiKey && { openAIKey: apiKey }),
          ...(options.model && { openAIModel: options.model }),
          ...(options.prompt && { openAIPrompt: options.prompt }),
          ...(options.maxTokens && { openAIMaxTokens: Number(options.maxTokens) }),
          ...(options.fileExtensions && { readFileExtensions: options.fileExtensions }),
          ...(options.readType && { readType: options.readType }),
          ...(options.readGitStatus && { readGitStatus: options.readGitStatus }),
          ...(options.readDirName && { readFilesRootName: options.readDirName }),
          ...(options.testFileType && { testFileType: options.testFileType }),
          ...(options.testFileDirName && { testFileDirName: options.testFileDirName }),
          ...(options.reviewReportWebhook && { reviewReportWebhook: options.reviewReportWebhook }),
          ...(options.openAISessionToken && { openAISessionToken: options.openAISessionToken }),
          ...(options.openAIProxyUrl && { openAIProxyUrl: options.openAIProxyUrl }),
          ...(options.translate && { translate: options.translate })
        };
        main(userOptions);
        break;
      }
      default:
        console.error(`Invalid run type: ${runType}, please use one of ${runTypes.join(', ')}`);
        process.exit(1);
    }
  });

program.parse(process.argv);
