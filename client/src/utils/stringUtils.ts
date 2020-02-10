import { memoize } from 'lodash';

const hashCodeFn = (string: string) => {
  let hash = 0;
  if (string.length === 0) return hash;
  for (let i = 0; i < string.length; i++) {
    let chr = string.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

export const hashCode = memoize(hashCodeFn);