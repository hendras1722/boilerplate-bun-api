import { SQL } from "bun";
import path from "path";

const dbPath = path.resolve(import.meta.dir, "../../database/app.db");

export const sql = new SQL({
  adapter: "sqlite",
  filename: dbPath,
  create: true,
  readwrite: true,
  strict: true,
  onconnect: () => console.log("SQLite database connected"),
});
