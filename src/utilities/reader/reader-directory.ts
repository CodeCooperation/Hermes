import fs from 'fs';
import path from 'path';

import { IReadFileResult } from '../types';

class ReadTestFilePathsByDirectory {
  private getFilesInDirectory(dirPath: string): string[] {
    return fs.readdirSync(dirPath);
  }

  private isDirectory(filePath: string): boolean {
    return fs.statSync(filePath).isDirectory();
  }

  private getSubDirectoryFilePaths(filePath: string): IReadFileResult[] {
    return this.getDirFiles(filePath);
  }

  private getFileContent(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
  }

  public getDirFiles(dirPath: string): IReadFileResult[] {
    if (!this.isDirectory(dirPath)) {
      return [{ filePath: dirPath, fileContent: this.getFileContent(dirPath) }];
    }

    const filesPath = this.getFilesInDirectory(dirPath);

    return filesPath.reduce((fileResult: IReadFileResult[], file: string) => {
      const filePath = path.join(dirPath, file);

      if (this.isDirectory(filePath)) {
        const subDirFileResults = this.getSubDirectoryFilePaths(filePath);
        return [...fileResult, ...subDirFileResults];
      }

      return [
        ...fileResult,
        { filePath, fileContent: this.getFileContent(filePath) },
      ];
    }, [] as IReadFileResult[]);
  }
}

export default ReadTestFilePathsByDirectory;
