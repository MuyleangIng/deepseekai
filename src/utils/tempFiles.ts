
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const TEMP_DIR = path.join(process.cwd(), 'tmp');

export interface GeneratedFile {
  name: string;
  content: string;
}

export async function ensureTempDir() {
  try {
    await fs.access(TEMP_DIR);
  } catch {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }
}

export async function saveTempFiles(files: GeneratedFile[]) {
  await ensureTempDir();
  
  const projectId = uuidv4();
  const projectDir = path.join(TEMP_DIR, projectId);
  
  await fs.mkdir(projectDir);
  
  const savedFiles = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(projectDir, file.name);
      await fs.writeFile(filePath, file.content);
      return {
        name: file.name,
        path: filePath,
        content: file.content
      };
    })
  );
  
  return {
    id: projectId,
    files: savedFiles
  };
}