import { createCipheriv, randomBytes } from "node:crypto";
import Env from "@/env";

// AES-256-GCM, stored as base64(iv):base64(authTag):base64(ciphertext)
// Generate a key with: openssl rand -base64 32  (set it as PASSPORT_ENCRYPTION_KEY)
export function encrypt(plain: string) {
  const key = Buffer.from(Env.PASSPORT_ENCRYPTION_KEY ?? "", "base64");
  if (key.length !== 32)
    throw new Error("PASSPORT_ENCRYPTION_KEY must be 32 bytes, base64 encoded");

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data]
    .map((b) => b.toString("base64"))
    .join(":");
}
