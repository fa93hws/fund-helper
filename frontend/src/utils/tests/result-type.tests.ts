import { unwrap, Result } from '../result-type';

describe('Result', () => {
  it('unwrap the data if no error', () => {
    const result: Result<number, string> = {
      kind: 'ok',
      data: 1,
    };
    expect(unwrap(result)).toEqual(1);
  });

  it('throw during unwrap if there is error', () => {
    const result: Result<number, string> = {
      kind: 'error',
      error: 'there is an error!',
    };
    expect(() => unwrap(result)).toThrowError('there is an error!');
  });
});
