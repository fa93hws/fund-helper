export class UnreachableError extends Error {
  constructor(val: never, msg?: string) {
    super();
    this.message =
      msg == null ? `unreachable case: ${JSON.stringify(val)}` : msg;
  }
}
