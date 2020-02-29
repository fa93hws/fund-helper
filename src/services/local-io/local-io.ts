import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const CACHE_LOCATION = 'data';

type ReadFileResult = { kind: 'found'; content: string } | { kind: 'notFound' };

export class LocalIOService {
  private readonly folder: string;

  private readonly fs: typeof fs;

  constructor({ folder, _fs = fs }: { folder: string; _fs?: typeof fs }) {
    this.folder = folder;
    this.fs = _fs;
  }

  private ensureFolderExists(dirname: string) {
    if (this.fs.existsSync(dirname)) {
      return;
    }
    this.fs.mkdirSync(dirname, { recursive: true });
  }

  private resolvePath(filename: string) {
    return path.join(REPO_ROOT, CACHE_LOCATION, this.folder, filename);
  }

  write(filename: string, content: object) {
    const filePath = this.resolvePath(filename);
    this.ensureFolderExists(path.dirname(filePath));
    this.fs.writeFileSync(filePath, JSON.stringify(content), {
      encoding: 'utf-8',
    });
  }

  read(filename: string): ReadFileResult {
    const filePath = this.resolvePath(filename);
    if (!this.fs.existsSync(filePath)) {
      return { kind: 'notFound' };
    }
    return {
      kind: 'found',
      content: this.fs.readFileSync(filePath, { encoding: 'utf-8' }),
    };
  }
}
