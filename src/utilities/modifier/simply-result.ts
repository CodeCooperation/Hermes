import {
  codeBlocksMdSymbolRegex,
  codeBlocksRegex,
  reviewFileName,
} from 'src/utilities/constant';

export const replaceCodeBlock = (
  data: string,
  placeholder: string = `check your local __${reviewFileName}__`,
) => {
  return data.replace(codeBlocksRegex, placeholder);
};

export const getAllCodeBlock = (data: string): string => {
  const codeBlocks = data.match(codeBlocksRegex);
  return codeBlocks
    ? codeBlocks
        ?.map((t) =>
          codeBlocksMdSymbolRegex.test(t)
            ? t.replace(codeBlocksMdSymbolRegex, '')
            : t,
        )
        .join('')
    : data;
};

export const simplyReviewData = (data: string) => {
  return replaceCodeBlock(data)
    .replace(/'/g, '')
    .replace(/`/g, '__')
    .replace(/\n/g, '\\r');
};
