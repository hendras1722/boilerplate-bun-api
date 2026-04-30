import { SQL } from "bun";
import { Database } from "bun:sqlite";

import path from "path";

const dbPath = path.resolve(import.meta.dir, "../../database/app.db");

// export const sql = new SQL({
//   adapter: "sqlite",
//   filename: dbPath,
//   create: true,
//   readwrite: true,
//   strict: true,
//   onconnect: () => console.log("SQLite database connected"),
// });

const sql = new Database("app.db");

sql.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);  
`)

export {
  sql
}
