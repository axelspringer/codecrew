import { mkdtemp } from 'node:fs/promises';
import { join } from 'node:path'
import { tmpdir } from 'node:os'

export const createTempDir = async (prefix: string): Promise<string> => {
    const tempDirPath = await mkdtemp(join(tmpdir(), `${prefix}-`));
    return tempDirPath
}