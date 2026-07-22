/** Tiny filesystem JSON store under web/data/. Assumes a Node host with a writable
 *  disk (fine for this scale; swap for a DB/KV on serverless). Used for locked +
 *  graded dev cards; the seed card ships committed under data/graded/. */
import { promises as fs } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "data");

export async function readJSON<T>(rel: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(path.join(ROOT, rel), "utf8")) as T;
  } catch {
    return null;
  }
}

export async function writeJSON(rel: string, data: unknown): Promise<void> {
  const p = path.join(ROOT, rel);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf8");
}

export async function listIds(dir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(path.join(ROOT, dir));
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

export async function has(rel: string): Promise<boolean> {
  try {
    await fs.access(path.join(ROOT, rel));
    return true;
  } catch {
    return false;
  }
}
