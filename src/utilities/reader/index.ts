import fs from 'fs';
import ora from 'ora';
import path from 'path';
import { userOptions } from 'src/utilities/constant';

import { IReadFileResult, ReadTypeEnum } from '../types';
import ReadTestFilePathsByDirectory from './reader-directory';
import StagedFileReader from './reader-git-stage';

class ReadFiles {
  private dirPath: string;
  private fileExtensions: string[];

  constructor({
    dirPath = userOptions.readFilesRoot,
    fileExtensions = userOptions.readFilesExtensions,
  } = {}) {
    this.dirPath = dirPath;
    this.fileExtensions = fileExtensions;
  }

  readTypeMap: Record<ReadTypeEnum, () => IReadFileResult[]> = {
    [ReadTypeEnum.Directory]: () => this.getTestFilePathByDir(),
    [ReadTypeEnum.GitStage]: () => this.getTestFilePathByGit(),
  };

  private getTestFilePathByDir(): IReadFileResult[] {
    const reader = new ReadTestFilePathsByDirectory();
    return reader.getDirFiles(this.dirPath);
  }

  private getTestFilePathByGit(): IReadFileResult[] {
    const reader = new StagedFileReader();
    return reader.getStagedFiles();
  }

  private hasValidExtension(file: string): boolean {
    const extension = path.extname(file);
    if (!this.fileExtensions.length) return true;

    return this.fileExtensions.some(
      (ext) => ext === extension || ext === extension.slice(1),
    );
  }

  private isTestFile(file: string): boolean {
    const extension = path.extname(file);
    const testFileType = userOptions.options.testFileType;
    return file.endsWith(`.${testFileType}${extension}`);
  }

  public getFileResults(
    readFileType = userOptions.readFileType,
  ): IReadFileResult[] {
    if (!this.readTypeMap[readFileType])
      throw new Error('Invalid test file read type');

    const readSpinner = ora({
      text: '🪄 [ 🧙 hermes ] Reading files...',
    }).start();

    try {
      const fileResults = this.readTypeMap[readFileType]().filter(
        ({ filePath: path }) =>
          path && this.hasValidExtension(path) && !this.isTestFile(path),
      );

      if (userOptions.options.debug) {
        console.log(
          '[ 🧙 hermes ] read files ===>',
          fileResults.map((r) => r.filePath),
        );
      }

      fileResults.length > 0
        ? readSpinner.succeed(
            '🌟🌟 [ 🧙 hermes ] read files successfully! 🌟🌟',
          )
        : readSpinner.warn('🤔🤔 [ 🧙 hermes ] read no files! 🤔🤔');
      return fileResults;
    } catch (error) {
      readSpinner.fail(`[ 🧙 hermes ] read files failed: ${error}`);
      throw error;
    }
  }
}

export default ReadFiles;
