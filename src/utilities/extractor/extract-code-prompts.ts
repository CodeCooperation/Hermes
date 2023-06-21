import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import fs from 'fs';
import { userOptions } from 'src/utilities/constant';
import { IReadFileResult } from '../types';

const traverseFunc =
  typeof traverse === 'function' ? traverse : (traverse as any).default;
const generateFunc =
  typeof generate === 'function' ? generate : (generate as any).default;

export class ExtractCodePrompts {
  private remainingCode: string[];
  private remainingEndIndex;

  constructor() {
    this.remainingCode = [];
    this.remainingEndIndex = 0;
  }

  private isFunctionOrClass(nodePath: NodePath | null): boolean {
    if (!nodePath) return true;

    const isVariableDeclarationFunction =
      nodePath.isVariableDeclaration() &&
      nodePath.node.declarations.some(
        (d) =>
          d.init &&
          (d.init.type === 'FunctionExpression' ||
            d.init.type === 'ArrowFunctionExpression'),
      );

    return (
      nodePath.isFunction() ||
      nodePath.isClass() ||
      isVariableDeclarationFunction
    );
  }

  public extractFunctionOrClassCodeArray({
    fileContent,
    filePath,
  }: IReadFileResult): string[] {
    try {
      const ast = parse(fileContent, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      traverseFunc(ast, {
        enter: (nodePath) => {
          if (Number(nodePath.node.start) < this.remainingEndIndex) return;

          if (!this.isFunctionOrClass(nodePath)) return;

          this.remainingEndIndex = Number(nodePath.node.end);
          const codeSnippet = generateFunc(nodePath.node).code;
          this.remainingCode.push(codeSnippet);
        },
      });

      return this.remainingCode;
    } catch (e) {
      if (userOptions.options?.debug) console.error('Babel parse error: ', e);
      return [
        fs.existsSync(filePath)
          ? fs.readFileSync(filePath, 'utf-8')
          : fileContent,
      ];
    }
  }
}
