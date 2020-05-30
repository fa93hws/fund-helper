import { join } from 'path';
import { PGConfigProvider } from '../pg-config.provider';
import { fakeConsoleLogService } from '../../log/fake/fake-console-log.service';

describe('PGConfigProvider', () => {
  const filePath = join(__dirname, 'fixtures', 'dc.yml');

  it('parsed the docker file content to config in dev', () => {
    const configProvider = new PGConfigProvider(
      { env: 'dev' },
      fakeConsoleLogService,
      filePath,
    );
    expect(configProvider.config).toEqual({
      user: 'dev-user',
      password: 'dev-pwd',
      database: 'dev-db',
      port: 54321,
    });
  });

  it('parsed the docker file content to config in prod', () => {
    const configProvider = new PGConfigProvider(
      { env: 'prod' },
      fakeConsoleLogService,
      filePath,
    );
    expect(configProvider.config).toEqual({
      user: 'prod-user',
      password: 'prod-pwd',
      database: 'prod-db',
      port: 5432,
    });
  });
});
