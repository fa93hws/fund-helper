import { EnvProvider } from '../env.provider';
import { fakeConsoleLogService } from '../../log/fake/fake-console-log.service';

describe('EnvProvider', () => {
  it('parse to dev if DEV exist in env', () => {
    process.env.DEV = 'true';
    const envProvider = new EnvProvider(fakeConsoleLogService);
    expect(envProvider.env).toEqual('dev');
  });

  it('parse to prod if DEV does not exist in env', () => {
    delete process.env.DEV;
    const envProvider = new EnvProvider(fakeConsoleLogService);
    expect(envProvider.env).toEqual('prod');
  });
});
