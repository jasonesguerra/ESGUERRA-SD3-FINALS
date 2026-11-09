import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const defaultFile = path.join(directory, 'data', 'store.json');

export function createStore(filePath = defaultFile) {
  return {
    async read() {
      return JSON.parse(await readFile(filePath, 'utf8'));
    },
    async write(data) {
      await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    },
  };
}