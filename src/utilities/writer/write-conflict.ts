function getConflictResult(
  sourceContent: string,
  targetContent: string,
): string {
  const removeStartAndEndEmptyLine = (content: string): string[] => {
    const lines = content.split('\n');
    let start = 0;
    let end = lines.length - 1;
    return lines.filter((line, index) => {
      if (line.trim() === '' && index === start) {
        start += 1;
        return false;
      }
      if (line.trim() === '' && index === end) {
        end -= 1;
        return false;
      }
      return true;
    });
  };

  const findFirstNotSameLineNumber = (
    sourceLines: string[],
    targetLines: string[],
  ): number => {
    let i = 0;
    for (; i < sourceLines.length && i < targetLines.length; i++) {
      if (sourceLines[i] !== targetLines[i]) {
        break;
      }
    }
    return i;
  };

  const findReverseSameLinesLength = (
    sourceLines: string[],
    targetLines: string[],
  ): number => {
    let i = 0;
    const sourceLinesReverse = sourceLines.slice().reverse();
    const targetLinesReverse = targetLines.slice().reverse();

    for (
      ;
      i < sourceLinesReverse.length && i < targetLinesReverse.length;
      i++
    ) {
      if (sourceLinesReverse[i] !== targetLinesReverse[i]) {
        break;
      }
    }
    return i;
  };

  const sourceLines = removeStartAndEndEmptyLine(sourceContent);
  const targetLines = removeStartAndEndEmptyLine(targetContent);

  if (sourceLines.join('\n') === targetLines.join('\n')) {
    return sourceContent;
  }

  const firstNotSameLineNumber = findFirstNotSameLineNumber(
    sourceLines,
    targetLines,
  );
  const reverseSameLinesLength = findReverseSameLinesLength(
    sourceLines,
    targetLines,
  );

  const resultLines: string[] = [
    ...sourceLines.slice(0, firstNotSameLineNumber),
    '<<<<<<< HEAD',
    ...sourceLines.slice(
      firstNotSameLineNumber,
      sourceLines.length - reverseSameLinesLength,
    ),
    '=======',
    ...targetLines.slice(
      firstNotSameLineNumber,
      targetLines.length - reverseSameLinesLength,
    ),
    '>>>>>>> Incoming',
    ...sourceLines.slice(sourceLines.length - reverseSameLinesLength),
  ];

  return resultLines.join('\n');
}

export default getConflictResult;
