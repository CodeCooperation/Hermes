import { execSync } from 'child_process';

class GitDiffExtractor {
  private getGitDiffOutput(filePath: string): string {
    return execSync(`git diff --cached ${filePath}`).toString();
  }

  private getModifiedLineNumbers(diffLines: string[]): number[] {
    const modifiedLineNumbers: number[] = [];
    let currentLineNumber = 0;

    for (const line of diffLines) {
      if (line.startsWith('@@ ')) {
        const match = line.match(/\+(\d+)/);
        if (match) {
          currentLineNumber = parseInt(match[1], 10) - 1;
        }
      } else if (
        line.startsWith('+') &&
        !line.startsWith('++') &&
        !line.startsWith('@@')
      ) {
        modifiedLineNumbers.push(currentLineNumber);
        currentLineNumber++;
      } else if (!line.startsWith('-')) {
        currentLineNumber++;
      }
    }

    return modifiedLineNumbers;
  }

  private extractCodeBlock(lines: string[], lineNumber: number): string | null {
    let startLine = lineNumber;
    let endLine = lineNumber;
    const blockPattern =
      /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\b|class\b|.*=>|\(.*\)\s*=>|\(\s*\)\s*=>)/;
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
        openBraces += this.countChar(line, '{');
        openBraces -= this.countChar(line, '}');

        if (openBraces === 0) {
          endLine = i;
          break;
        }
      }
    }

    if (startLine < 0 || endLine >= lines.length || !lines[startLine]) {
      return null;
    }

    return lines.slice(startLine, endLine + 1).join('\n');
  }

  private findClosingBrace(lines: string[], startLine: number): number {
    let openBraces = 0;

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      openBraces += this.countChar(line, '{');
      openBraces -= this.countChar(line, '}');

      if (openBraces === 0) {
        return i;
      }
    }

    return lines.length - 1;
  }

  private countChar(line: string, char: string): number {
    return line?.split(char).length - 1 || 0;
  }

  private isCodeBlockContainedInExistingBlocks(
    codeBlock: string,
    existingBlocks: string[],
  ): boolean {
    for (const existingBlock of existingBlocks) {
      if (existingBlock.includes(codeBlock)) {
        return true;
      }
    }
    return false;
  }

  private addCodeBlockIfNotContained(blocks: string[], newBlock: string): void {
    if (
      !this.isCodeBlockContainedInExistingBlocks(newBlock, blocks) &&
      !blocks.includes(newBlock)
    ) {
      blocks.push(newBlock);
    }
  }

  public extractModifiedFunction(
    filePath: string,
    contents: string,
  ): string | null {
    const diffOutput = this.getGitDiffOutput(filePath);
    const diffLines = diffOutput?.split('\n');
    if (!diffLines || !contents) return null;

    const modifiedLineNumbers = this.getModifiedLineNumbers(diffLines);
    if (modifiedLineNumbers.length === 0) return null;

    const lines = contents.split('\n');
    const extractedCodeBlocks: string[] = [];

    for (const lineNumber of modifiedLineNumbers) {
      const codeBlock = this.extractCodeBlock(lines, lineNumber);
      if (codeBlock) {
        this.addCodeBlockIfNotContained(extractedCodeBlocks, codeBlock);
      }
    }

    return extractedCodeBlocks.join('\n\n');
  }
}

export default GitDiffExtractor;
