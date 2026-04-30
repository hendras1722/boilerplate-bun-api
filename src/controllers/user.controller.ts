import type { BunRequest } from "bun";
import { sql } from "../database/sqlite";
import type { User, CreateUserInput } from "../models/user.model";
import { ApiResponse } from "../utils/response";

export const UserController = {
  async getAllUsers() {
    const users = sql.query("SELECT * FROM users").all();
    return Response.json(users);
  },

  async createUser(req: BunRequest<"/api/v2/create-user">) {
    try {
      const data = await req.json() as CreateUserInput;
      const result = sql.query("INSERT INTO users (name, email) VALUES (?, ?) RETURNING *").get(data.name, data.email);

      return ApiResponse.success(result, 201);
    } catch (err) {
      return ApiResponse.error("Failed to create user", err instanceof Error ? err.message : String(err));
    }
  },

  async deleteUser(req: BunRequest<"/api/v2/delete-user/:id">, id: string) {
    if (!id) {
      return ApiResponse.error("Missing id parameter", null, 400);
    }
    const result = sql.query("DELETE FROM users WHERE id = ?").run(id);
    if (result.changes === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    return ApiResponse.success({ message: 'User deleted successfully', id });
  }
};
