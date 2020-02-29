import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const CACHE_LOCATION = 'data';

type ReadFileResult = { kind: 'found'; content: string } | { kind: 'notFound' };

export class LocalIOService {
  constructor(private readonly folder: string) {}
  private static ensureFolderExists(dirname: string) {
    if (fs.existsSync(dirname)) {
      return;
    }
    fs.mkdirSync(dirname, { recursive: true });
  }

  private resolvePath(filename: string) {
    return path.join(REPO_ROOT, CACHE_LOCATION, this.folder, filename);
  }

  write(filename: string, content: object) {
    const filePath = this.resolvePath(filename);
    LocalIOService.ensureFolderExists(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(content), { encoding: 'utf-8' });
  }

  read(filename: string): ReadFileResult {
    const filePath = this.resolvePath(filename);
    if (!fs.existsSync(filePath)) {
      return { kind: 'notFound' };
    }
    return {
      kind: 'found',
      content: fs.readFileSync(filePath, { encoding: 'utf-8' }),
    };
  }
}
