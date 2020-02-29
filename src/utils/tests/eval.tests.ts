import { evalInVm } from '../eval';

describe('evalInVm', () => {
  it('execute the code and retrive the golbal variable', () => {
    const code = `
      var a = {};
      a.foo = 1;
      a.bar = '2';
    `;
    const context = evalInVm(code);
    expect(context.a).toEqual({ foo: 1, bar: '2' });
  });
});
