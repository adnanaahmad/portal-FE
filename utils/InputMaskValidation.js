function _repeat(letter, length) {
  return letter.repeat(length);
}

function replaceMaskWithLetter(value, letter, length, validationYear) {
  if (!value) value = ``;
  value = value.replace(/[^0-9]/g, ``);
  if (letter === `m`) {
    if (+value > 12) {
      return `1m`;
    } else {
      return value + _repeat(letter, length - value.length);
    }
  } else if (letter === `d`) {
    if (+value > 31) {
      return `3d`;
    } else {
      return value + _repeat(letter, length - value.length);
    }
  } else if (letter === `y`) {
    if (value.length === 4) {
      const currentYear = new Date().getFullYear();
      if (validationYear === "greater") {
        if (+value <= +currentYear) {
          return `yyyy`;
        } else {
          return value + _repeat(letter, length - value.length);
        }
      } else if (validationYear === "less") {
        if (+value >= +currentYear) {
          return `yyyy`;
        } else {
          return value + _repeat(letter, length - value.length);
        }
      } else {
        return value + _repeat(letter, length - value.length);
      }
    } else {
      return value + _repeat(letter, length - value.length);
    }
  } else {
    return value + _repeat(letter, length - value.length);
  }
}

function fillInMaskWithLetters(value, validationYear) {
  if (!value) return ``;

  const [month, day, year] = value.split(`/`);
  return [
    replaceMaskWithLetter(month, `m`, 2),
    replaceMaskWithLetter(day, `d`, 2),
    replaceMaskWithLetter(year, `y`, 4, validationYear),
  ].join(`/`);
}

function findFirstPlaceholderIndex(value) {
  const placeholderPositions = [
    value.indexOf(`m`),
    value.indexOf(`d`),
    value.indexOf(`y`),
  ].filter((position) => position >= 0);

  if (placeholderPositions.length === 0) return undefined;

  return Math.min(...placeholderPositions);
}

export function handleMaskValueChange(state, validationYear) {
  const value = fillInMaskWithLetters(state.nextState.value, validationYear);
  let selection = state.nextState.selection;
  const findFirst = findFirstPlaceholderIndex(value);
  let index;
  if (findFirst >= 0) {
    index = findFirst;
  } else {
    index = selection.start;
  }

  selection = {
    start: index,
    end: index,
    length: 1,
  };

  return { value, selection };
}

export const datePattern = "19/39/2999";
export const dateFormatChars = {
  '9': '[0-9]',
  'a': '[A-Za-z]',
  '*': '[A-Za-z0-9]',
  '1': '[0-1]',
  '2': '[1-2]',
  '3': '[0-3]'
};