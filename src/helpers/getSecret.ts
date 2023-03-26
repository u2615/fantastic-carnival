import { readFile } from "node:fs/promises";

export async function getSecret(path: string): Promise<string> {
  try {
    const filePath = new URL(path, import.meta.url);
    return await readFile(filePath, { encoding: "utf-8" });
  } catch (e: any) {
    throw Error(e);
  }
}
