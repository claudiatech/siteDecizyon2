import { promises as fs } from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

export type UploadResult = {
  filename: string;
  url: string;
  mimeType: string;
  size: number;
};

export interface StorageProvider {
  save(file: File): Promise<UploadResult>;
}

const uploadDir = path.join(process.cwd(), "public", "uploads");

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "-");
}

async function saveLocal(file: File): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(uploadDir, { recursive: true });
  const safeName = sanitizeFilename(file.name);
  const filename = `${uuid()}-${safeName}`;
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);

  return {
    filename: file.name,
    url: `/uploads/${filename}`,
    mimeType: file.type || "application/octet-stream",
    size: buffer.length
  };
}

export const storageProvider: StorageProvider = {
  save: saveLocal
};

export async function saveUpload(file: File) {
  return storageProvider.save(file);
}
