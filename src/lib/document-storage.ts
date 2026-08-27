import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

// Stored outside /public so generated clinical documents are never directly
// web-accessible — they're only reachable through the authenticated
// /api/documents/[id]/download route, which checks patient ownership.
const STORAGE_DIR = path.join(process.cwd(), "storage", "documents");

export async function savePdf(filename: string, buffer: Buffer): Promise<string> {
  await mkdir(STORAGE_DIR, { recursive: true });
  await writeFile(path.join(STORAGE_DIR, filename), buffer);
  return filename;
}

export async function readPdf(filename: string): Promise<Buffer> {
  return readFile(path.join(STORAGE_DIR, filename));
}

export async function deletePdf(filename: string): Promise<void> {
  try {
    await unlink(path.join(STORAGE_DIR, filename));
  } catch (err) {
    // Already gone from disk is fine — the DB row is still the source of
    // truth we're removing; don't fail the request over a missing file.
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}
