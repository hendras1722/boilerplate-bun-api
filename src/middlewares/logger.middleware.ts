import { appendFile } from "node:fs/promises";
import { join } from "node:path";

export const logger = async (req: Request) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;

  console.log(`[${timestamp}] ${method} ${url}`);

  return async (res?: Response, error?: any, message?: string) => {
    const duration = Date.now() - start;
    const status = res?.status || (error ? 500 : 0);

    let errorMsg = message || "";
    if (error) {
      errorMsg = errorMsg || (error instanceof Error ? error.message : String(error));
    } else if (typeof status === "number" && status >= 400 && !errorMsg) {
      errorMsg = "Client/Server Error";
    }

    const statusDisplay = status === 0 ? "???" : status;
    const logEntry = `[${timestamp}] ${method} ${url} - Status: ${statusDisplay} - Duration: ${duration}ms${errorMsg ? ` - Msg: ${errorMsg}` : ""}\n`;

    console.log(`  └─ Completed with status ${statusDisplay} in ${duration}ms`);
    if (errorMsg) console.error(`  └─ Error: ${errorMsg}`);

    try {
      await appendFile(join(process.cwd(), "app.log"), logEntry);
    } catch (err) {
      console.error("Failed to write log to file:", err);
    }
  };
};


