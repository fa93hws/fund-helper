import * as path from 'path';
import * as fs from 'fs';
import { LocalIOService } from '../local-io';

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

describe('LocalIOService', () => {
  const writeFileSync = jest.fn();
  const readFileSync = jest.fn();
  const mkdirSync = jest.fn();
  const existsSync = jest.fn();
  const folder = 'folder';
  const filename = 'filename.json';
  const pathToFolder = path.join(REPO_ROOT, 'data', 'folder');
  const pathToFile = path.join(pathToFolder, filename);
  const _fs = ({
    existsSync,
    writeFileSync,
    readFileSync,
    mkdirSync,
  } as any) as typeof fs;

  afterEach(() => {
    writeFileSync.mockClear();
    readFileSync.mockClear();
    existsSync.mockClear();
    mkdirSync.mockClear();
  });

  it('should write json to file in data folder', () => {
    existsSync.mockReturnValueOnce(true);
    const localIOService = new LocalIOService({ folder, _fs });
    localIOService.write(filename, { a: 1, b: [1], c: '123' });
    expect(writeFileSync).toHaveBeenCalledWith(
      pathToFile,
      '{"a":1,"b":[1],"c":"123"}',
      { encoding: 'utf-8' },
    );
  });

  it('will create directory if not exists', () => {
    existsSync.mockReturnValueOnce(false);
    const localIOService = new LocalIOService({ folder, _fs });
    localIOService.write(filename, { a: 1, b: [1], c: '123' });
    expect(existsSync).toHaveBeenCalledWith(pathToFolder);
    expect(mkdirSync).toHaveBeenCalledWith(pathToFolder, { recursive: true });
    expect(writeFileSync).toHaveBeenCalledWith(
      pathToFile,
      '{"a":1,"b":[1],"c":"123"}',
      { encoding: 'utf-8' },
    );
  });

  it('reports not found if file does not exist during get', () => {
    existsSync.mockReturnValueOnce(false);
    const localIOService = new LocalIOService({ folder, _fs });
    const result = localIOService.read(filename);
    expect(existsSync).toHaveBeenCalledWith(pathToFile);
    expect(result).toEqual({ kind: 'notFound' });
  });

  it('return the file content if found', () => {
    existsSync.mockReturnValueOnce(true);
    readFileSync.mockReturnValueOnce('{ "a": a }');
    const localIOService = new LocalIOService({ folder, _fs });
    const result = localIOService.read(filename);
    expect(existsSync).toHaveBeenCalledWith(pathToFile);
    expect(readFileSync).toHaveBeenCalledWith(pathToFile, {
      encoding: 'utf-8',
    });
    expect(result).toEqual({ kind: 'found', content: '{ "a": a }' });
  });
});
