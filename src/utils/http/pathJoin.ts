import { trimSlashes } from 'src/utils/strings';

const DIVIDER = '/';

export function pathJoin(...args: string[]) {
  return args.reduce((accum, arg) => {
    const part = trimSlashes(arg);

    if (!part) return accum;
    if (!accum) return part;

    return [accum, part].join(DIVIDER);
  }, '');
}
