import { Pool } from 'pg';
import { parse } from 'yaml';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const REPO_DIR = resolve(__dirname, '..', '..', '..');

function getConfigFromFile(env: 'prod' | 'test') {
  const pgConfigContent = readFileSync(
    resolve(REPO_DIR, 'docker-compose.yml'),
    { encoding: 'utf-8' },
  );
  const pgConfig = parse(pgConfigContent);
  const dbConfig = pgConfig.services[`db-${env}`];
  const {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
  } = dbConfig.environment;
  const portsBinding: string[] = dbConfig.ports;
  const port = parseInt(portsBinding[0].split(':')[0], 10);
  if (
    POSTGRES_USER == null ||
    POSTGRES_PASSWORD == null ||
    POSTGRES_DB == null ||
    Number.isNaN(port) ||
    !isFinite(port)
  ) {
    throw new Error(
      'POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB or ports can not be parsed from docker file',
    );
  }
  return {
    user: POSTGRES_USER,
    pwd: POSTGRES_PASSWORD,
    db: POSTGRES_DB,
    port,
  };
}

export function createPool(env: 'prod' | 'test') {
  const { user, pwd, db, port } = getConfigFromFile(env);
  return new Pool({
    connectionString: `postgres://${user}:${pwd}@localhost:${port}/${db}`,
  });
}
