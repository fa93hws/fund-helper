export type Result<T, E = Error> =
  | {
      kind: 'ok';
      data: T;
    }
  | {
      kind: 'error';
      error: E;
    };

export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.kind === 'ok') {
    return result.data;
  }
  throw result.error;
}
