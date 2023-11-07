import fs from 'fs';
import inquirer from 'inquirer';
import ora from 'ora';
import { HermesModify } from 'src/hermes';
import { IReadFileResult } from 'src/types';
import { userOptions } from 'src/utilities/constant';
import getConflictResult from 'src/utilities/writer/write-conflict';

class ModifyCLI {
  private hermes: HermesModify;

  constructor(private readFileResult: IReadFileResult[]) {
    this.init();
  }

  private init() {
    this.hermes = new HermesModify();
  }

  private async promptOptionDescription(): Promise<string> {
    const { description } = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        default: `Please fix bugs or optimize my code, and extract constant variable or enum variable. if the function is complexity, please chunk it. If it's functional component, use react hooks optimize some UI component or functions. And add comments with ${
          userOptions.options.translate || 'en'
        } language for complexity logic steps.`,
        messages: `Please input your modify requirements`,
        validate: (input: string) =>
          input.trim() !== '' || 'Description cannot be empty.',
      },
    ]);

    return description;
  }

  private async promptContinueOrFinish(): Promise<boolean> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Do you want to continue or finish?',
        choices: ['Continue', 'Finish'],
      },
    ]);

    return action === 'Continue';
  }

  private writeFile(filePath: string, newContent: string) {
    fs.writeFileSync(
      filePath,
      getConflictResult(fs.readFileSync(filePath, 'utf-8'), newContent),
    );
  }

  private async runSingleFile(
    fileResult: IReadFileResult,
    continueTimes: number,
  ) {
    if (!fileResult?.filePath) throw new Error('File path is empty');

    console.log(`[ 🧙 hermes ] Start modify ${fileResult.filePath}...`);
    const description = await this.promptOptionDescription();
    const spinner = ora(`[ 🧙 hermes ] Processing...`).start();

    const prompts = [
      continueTimes === 0
        ? `My fileContent is: ${fileResult.fileContent}.`
        : '',
      `Please modify previous code by following requirements: ${description}`,
    ];
    const message = await this.hermes.run({
      ...this.readFileResult,
      prompts: [prompts.join('\n')],
    });
    if (!message?.length) {
      spinner.stop();
      return;
    }

    this.writeFile(fileResult.filePath, message.join('\n'));

    spinner.stop();
  }

  async start() {
    if (!this.readFileResult?.length) throw new Error('File path is empty');

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
}

export default ModifyCLI;
