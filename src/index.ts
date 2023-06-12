import 'isomorphic-fetch';

import { userOptions } from './constant';
import CreateCLI from './create';
import { HermesReview, HermesTest, HermesTranslate } from './hermes';
import ModifyCLI from './modify';
import ReadFiles from './reader';
import { HermesTypeEnum, IUserOptions, ReadTypeEnum } from './types';

const runMap: Record<HermesTypeEnum, () => void> = {
  [HermesTypeEnum.Test]: async () => {
    const testFilePaths = new ReadFiles();
    const files = testFilePaths.getFileResults();
    const hermes = new HermesTest();

    // Generate a test case for each file path
    for (const fileResult of files) {
      await hermes.run(fileResult);
    }
  },
  [HermesTypeEnum.Review]: async () => {
    const reviewFiles = new ReadFiles();
    const files = reviewFiles.getFileResults();
    const hermes = new HermesReview();

    // Review code for each file path
    for (const fileResult of files) {
      await hermes.run(fileResult);
    }

    // Publish the notices to the webhook channel
    hermes.publishNotice();
  },
  [HermesTypeEnum.Create]: async () => {
    const cli = new CreateCLI();

    await cli.start();
  },
  [HermesTypeEnum.Modify]: async () => {
    const reviewFiles = new ReadFiles();
    const files = reviewFiles.getFileResults();
    if (!files.length) return;

    // Modify for each file path
    const cli = new ModifyCLI(files);
    await cli.start();
  },
  [HermesTypeEnum.Translate]: async () => {
    const testFilePaths = new ReadFiles({ fileExtensions: [] });
    const files = testFilePaths.getFileResults(ReadTypeEnum.Directory);
    const hermes = new HermesTranslate();

    // Translate for each file path
    for (const fileResult of files) {
      await hermes.run(fileResult);
    }
  },
};

/**
 * Main function for hermes
 */
export function main(options?: IUserOptions) {
  userOptions.init(options);
  const type = userOptions.hermesType;

  if (!runMap[type]) throw new Error('Invalid hermesType: ' + type);

  // Print debug info
  if (userOptions.options.debug) {
    console.log(
      'Running hermes with options: ',
      JSON.stringify(userOptions.options),
    );
  }

  runMap[type]();
}

export default main;
