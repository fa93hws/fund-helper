import { UnreachableError } from '../error';

describe('UnreachableError', () => {
  it('has message if msg is not given', () => {
    const a = (undefined as any) as never;
    const error = new UnreachableError(a);
    expect(error.message).toMatchInlineSnapshot(
      `"unreachable case: undefined"`,
    );
  });

  it('show msg if it is given', () => {
    const a = (undefined as any) as never;
    const error = new UnreachableError(a, 'msg');
    expect(error.message).toEqual('msg');
  });
});
