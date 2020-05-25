export namespace Result {
  export type T<R, E = Error> =
    | {
        kind: 'ok';
        data: R;
      }
    | {
        kind: 'error';
        error: E;
      };

  export const createOk = <R>(data: R): T<R, any> => ({ kind: 'ok', data });
  export const createError = <E>(error: E): T<any, E> => ({
    kind: 'error',
    error,
  });

  export function unwrap<R, E>(result: T<R, E>): R {
    if (result.kind === 'ok') {
      return result.data;
    }
    throw result.error;
  }
}
