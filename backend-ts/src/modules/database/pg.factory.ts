import { join } from 'path';
import { readFileSync } from 'fs';
import { safeLoad } from 'js-yaml';
import { backendRoot } from '../../utils/paths';
import { PGService, PGServiceParam } from './pg.service';

function parsePGSqlParameters(dockerComposeFilePath: string): PGServiceParam {
  const dockerComposeFileContent = readFileSync(dockerComposeFilePath, {
    encoding: 'utf-8',
  });
  const dockerComposeConfig = safeLoad(dockerComposeFileContent);
  const { services } = dockerComposeConfig;
  if (services == null) {
    throw new Error(`services does not exist in docker compose file`);
  }
  const dbConfig = services['db-prod'];
  if (dbConfig == null) {
    throw new Error(`db-prod does not exist in docker compose file services`);
  }
  const { environment, ports } = dbConfig;
  if (environment == null || typeof ports[0] !== 'string') {
    throw new Error(
      'environment or ports does not exist in docker compose file',
    );
  }
  const [portStr] = ports[0].split(':');
  const port = parseInt(portStr, 10);
  if (isNaN(port)) {
    throw new Error('port must be integer!');
  }

  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = environment;
  if (
    typeof POSTGRES_USER !== 'string' ||
    typeof POSTGRES_PASSWORD !== 'string' ||
    typeof POSTGRES_DB !== 'string'
  ) {
    throw new Error('fail to get db connection data as string');
  }

  return {
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    dbName: POSTGRES_DB,
    port,
  };
}

export function pgServiceFactory() {
  const dockerComposeFilePath = join(backendRoot, 'docker-compose.yml');
  const param = parsePGSqlParameters(dockerComposeFilePath);
  return new PGService(param);
}
