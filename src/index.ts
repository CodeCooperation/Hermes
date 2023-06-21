import 'isomorphic-fetch';

import { HermesReview, HermesTest, HermesTranslate } from './hermes';
import { userOptions } from './utilities/constant';
import CreateCLI from './utilities/creator';
import ModifyCLI from './utilities/modifier';
import ReadFiles from './utilities/reader';
import { HermesTypeEnum, IUserOptions, ReadTypeEnum } from './utilities/types';

const runMap: Record<HermesTypeEnum, () => void> = {
  [HermesTypeEnum.Test]: async () => {
    const testFilePaths = new ReadFiles();
    const files = testFilePaths.getFileResults();
    const hermes = new HermesTest();

    for (const fileResult of files) {
      await hermes.run(fileResult);
    }
  },
  [HermesTypeEnum.Review]: async () => {
    const reviewFiles = new ReadFiles();
    const files = reviewFiles.getFileResults();
    const hermes = new HermesReview();

    for (const fileResult of files) {
      await hermes.run(fileResult);
    }
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

    const cli = new ModifyCLI(files);
    await cli.start();
  },
  [HermesTypeEnum.Translate]: async () => {
    const testFilePaths = new ReadFiles({ fileExtensions: [] });
    const files = testFilePaths.getFileResults(ReadTypeEnum.Directory);
    const hermes = new HermesTranslate();

    for (const fileResult of files) {
      await hermes.run(fileResult);
    }
  },
};

export function main(options?: IUserOptions) {
  userOptions.init(options);
  const type = userOptions.hermesType;

  if (!runMap[type]) throw new Error('Invalid hermesType: ' + type);

  if (userOptions.options.debug) {
    console.log(
      'Running hermes with options: ',
      JSON.stringify(userOptions.options),
    );
  }

  runMap[type]();
}

export default main;
