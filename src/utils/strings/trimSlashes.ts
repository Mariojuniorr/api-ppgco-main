import _trim from 'lodash/trim';

export function trimSlashes(val: string) {
  return _trim(val, '/');
}
