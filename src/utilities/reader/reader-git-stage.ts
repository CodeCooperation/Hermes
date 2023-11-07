import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { userOptions } from 'src/utilities/constant';

import GitDiffExtractor from '../extractor/extract-modify-funcs';
import { IReadFileResult } from '../types';

class StagedFileReader {
  private stagedFiles: IReadFileResult[];

  constructor() {
    this.stagedFiles = this.readStagedFiles();
  }

  private readStagedFiles(): IReadFileResult[] {
    const files = execSync('git diff --cached --name-status')
      .toString()
      .split('\n')
      .filter(Boolean);
    const readRootName = userOptions.options.readFilesRootName;
    const readGitStatus =
      userOptions.options.readGitStatus?.split(',').map((el) => el.trim()) ||
      [];

    if (!readRootName) throw new Error('readFilesRootName is not set');
    if (!readGitStatus.length) {
      console.warn('readGitStatus is not set, no reading staged files');
      return [];
    }

    return files.reduce<IReadFileResult[]>((acc, file) => {
      const fileSplitArr = file.split('\t');
      const status = fileSplitArr[0].slice(0, 1);
      const filePath = fileSplitArr.slice(-1)[0];
      const fullPath = path.join(process.cwd(), filePath);

      if (
        !readGitStatus.includes(status) ||
        !filePath.startsWith(`${readRootName}/`) ||
        !fs.existsSync(fullPath)
      ) {
        return acc;
      }

      const contents = fs.readFileSync(fullPath, 'utf-8');

      if (status !== 'M') {
        return [...acc, { filePath: fullPath, fileContent: contents }];
      }

      const codeExtractor = new GitDiffExtractor();
      const modifiedContents =
        codeExtractor.extractModifiedFunction(fullPath, contents) || '';
      return [
        ...acc,
        {
          filePath: fullPath,
          fileContent: modifiedContents,
        },
      ];
    }, []);
  }

  public getStagedFiles(): IReadFileResult[] {
    return this.stagedFiles;
  }
}

export default StagedFileReader;
