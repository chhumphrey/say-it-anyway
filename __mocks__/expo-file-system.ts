// Manual Jest mock for the new expo-file-system File/Directory/Paths API.
// jest-expo only mocks `expo-file-system/legacy`, not this one, so this
// fills the gap -- backed by a real temp directory via Node's fs so file
// semantics (exists, size, copy, delete) behave like the real thing rather
// than needing their own from-scratch reimplementation.
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'say-it-anyway-fs-mock-'));
const documentRoot = path.join(root, 'document');
const cacheRoot = path.join(root, 'cache');
fs.mkdirSync(documentRoot, { recursive: true });
fs.mkdirSync(cacheRoot, { recursive: true });

function toUri(absolutePath: string): string {
  return `file://${absolutePath}`;
}

function toFsPath(uri: string): string {
  return uri.startsWith('file://') ? uri.slice('file://'.length) : uri;
}

function joinUris(parts: (string | { uri: string })[]): string {
  const segments = parts.map((part) => (typeof part === 'string' ? part : toFsPath(part.uri)));
  const [first, ...rest] = segments;
  const firstPath = first.startsWith('file://') ? toFsPath(first) : first;
  return path.join(firstPath, ...rest);
}

export class Directory {
  private readonly fsPath: string;

  constructor(...uris: (string | File | Directory)[]) {
    this.fsPath = joinUris(uris as any);
  }

  get uri(): string {
    return toUri(this.fsPath);
  }

  get exists(): boolean {
    return fs.existsSync(this.fsPath) && fs.statSync(this.fsPath).isDirectory();
  }

  get name(): string {
    return path.basename(this.fsPath);
  }

  create(options?: { idempotent?: boolean; intermediates?: boolean }): void {
    if (this.exists && options?.idempotent) {
      return;
    }
    fs.mkdirSync(this.fsPath, { recursive: true });
  }

  list(): (File | Directory)[] {
    if (!this.exists) return [];
    return fs.readdirSync(this.fsPath).map((entry) => {
      const full = path.join(this.fsPath, entry);
      return fs.statSync(full).isDirectory() ? new Directory(toUri(full)) : new File(toUri(full));
    });
  }
}

export class File {
  private fsPath: string;

  constructor(...uris: (string | File | Directory)[]) {
    this.fsPath = joinUris(uris as any);
  }

  get uri(): string {
    return toUri(this.fsPath);
  }

  get exists(): boolean {
    return fs.existsSync(this.fsPath) && fs.statSync(this.fsPath).isFile();
  }

  get size(): number {
    return this.exists ? fs.statSync(this.fsPath).size : 0;
  }

  get name(): string {
    return path.basename(this.fsPath);
  }

  async copy(destination: File | Directory, options?: { overwrite?: boolean }): Promise<void> {
    const destPath =
      destination instanceof Directory ? path.join((destination as any).fsPath, path.basename(this.fsPath)) : (destination as any).fsPath;
    if (fs.existsSync(destPath) && !options?.overwrite) {
      throw new Error(`Destination already exists: ${destPath}`);
    }
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(this.fsPath, destPath);
  }

  delete(): void {
    fs.unlinkSync(this.fsPath);
  }

  write(content: string, options?: { encoding?: 'utf8' | 'base64' }): void {
    fs.mkdirSync(path.dirname(this.fsPath), { recursive: true });
    const buffer = options?.encoding === 'base64' ? Buffer.from(content, 'base64') : Buffer.from(content, 'utf8');
    fs.writeFileSync(this.fsPath, buffer);
  }

  async base64(): Promise<string> {
    return fs.readFileSync(this.fsPath).toString('base64');
  }
}

export const Paths = {
  document: new Directory(toUri(documentRoot)),
  cache: new Directory(toUri(cacheRoot)),
};

// Test-only helper (not part of the real expo-file-system API) so specs can
// seed files directly on the underlying fake filesystem without going
// through the public File API.
export function __writeRawFile(absolutePath: string, contents: string): void {
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, contents);
}

export function __pathFor(uri: string): string {
  return toFsPath(uri);
}
