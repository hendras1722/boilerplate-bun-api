import { createHmac } from "node:crypto";

const SECRET = process.env.APP_SECRET || "default-secret";

export const generateSignedUrl = (baseUrl: string, filename: string, expiresInMinutes: number = 60) => {
  const expires = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
  const dataToSign = `${filename}:${expires}`;
  
  const signature = createHmac("sha256", SECRET)
    .update(dataToSign)
    .digest("hex");

  const url = new URL(baseUrl, "http://localhost:3000"); // Base URL is relative or absolute
  url.searchParams.set("expires", expires.toString());
  url.searchParams.set("signature", signature);

  return `${url.pathname}${url.search}`;
};

export const verifySignature = (filename: string, expires: string, signature: string) => {
  const expiresTimestamp = parseInt(expires, 10);
  
  if (isNaN(expiresTimestamp) || expiresTimestamp < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const dataToSign = `${filename}:${expires}`;
  const expectedSignature = createHmac("sha256", SECRET)
    .update(dataToSign)
    .digest("hex");

  return expectedSignature === signature;
};
