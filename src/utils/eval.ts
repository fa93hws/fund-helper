import * as vm from 'vm';

export function evalInVm(code: string): any {
  const script = new vm.Script(code);
  const context = {};
  vm.createContext(context);
  script.runInContext(context);
  return context;
}