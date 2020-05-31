import { Injectable, Optional } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { safeLoad } from 'js-yaml';
import type { PGServiceParam } from '../database/pg.service';
import { EnvProvider } from './env.provider';
import { backendRoot } from '../../utils/paths';
import { ConsoleLogService } from '../log/console-log.service';

const DOCKER_COMPOSE_FILE_PATH = join(backendRoot, 'docker-compose.yml');

@Injectable()
export class PGConfigProvider {
  readonly config: PGServiceParam;

  constructor(
    envProvider: EnvProvider,
    private readonly logService: ConsoleLogService,
    @Optional() dockerComposeFilePath: string = DOCKER_COMPOSE_FILE_PATH,
  ) {
    this.logService.setContext(PGConfigProvider.name);
    this.config = this.parsePGSqlParameters(
      dockerComposeFilePath,
      envProvider.env,
    );
  }

  private parsePGSqlParameters(
    dockerComposeFilePath: string,
    env: 'prod' | 'dev',
  ): PGServiceParam {
    this.logService.info(
      `try parsing pg service parameter from docker file@${dockerComposeFilePath}`,
    );
    if (!existsSync(dockerComposeFilePath)) {
      this.logService.error(
        `docker compose file ${dockerComposeFilePath} does not exist`,
      );
      process.exit(1);
    }
    const dockerComposeFileContent = readFileSync(dockerComposeFilePath, {
      encoding: 'utf-8',
    });
    const dockerComposeConfig = safeLoad(dockerComposeFileContent);
    const { services } = dockerComposeConfig;
    if (services == null) {
      this.logService.error('services does not exist in docker compose file', {
        dockerComposeConfig,
      });
      process.exit(1);
    }
    const dbServiceName = env === 'prod' ? 'db-prod' : 'db-test';
    const dbConfig = services[dbServiceName];
    if (dbConfig == null) {
      this.logService.error(
        `${dbServiceName} does not exist in docker compose file services`,
        { services },
      );
      process.exit(1);
    }
    const { environment, ports } = dbConfig;
    if (environment == null || typeof ports[0] !== 'string') {
      this.logService.error(
        `environment or ports does not exist in ${dbServiceName}`,
      );
      process.exit(1);
    }
    const [portStr] = ports[0].split(':');
    const port = parseInt(portStr, 10);
    if (isNaN(port)) {
      this.logService.error('port must be integer!', { dbConfig });
      process.exit(1);
    }

    const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = environment;
    if (
      typeof POSTGRES_USER !== 'string' ||
      typeof POSTGRES_PASSWORD !== 'string' ||
      typeof POSTGRES_DB !== 'string'
    ) {
      this.logService.error('fail to get db connection data as string', {
        environment,
      });
      process.exit(1);
    }

    this.logService.info(`service parameter parsed`);
    return {
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DB,
      port,
    };
  }
}
