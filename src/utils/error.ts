export class UnreachableError {
  constructor(val: never, msg?: string) {
    return msg == null ? new Error(`unreachable case: ${val}`) : new Error(msg);
  }
}
