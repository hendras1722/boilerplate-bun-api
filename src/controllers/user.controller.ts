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
  },

  async getUserById(req: BunRequest<"/api/v1/users/:id">) {
    try {
      const id = req.params.id;
      if (!id) {
        return ApiResponse.error("Missing id parameter", null, 400);
      }

      const users = await Bun.sql`
        SELECT 
          id, 
          name, 
          email, 
          to_char(created_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD"T"HH24:MI:SS.US"+07:00"') as created_at,
          to_char(updated_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD"T"HH24:MI:SS.US"+07:00"') as updated_at
        FROM users 
        WHERE id = ${id} AND deleted_at IS NULL
      `;

      if (users.length === 0) {
        return ApiResponse.error("User not found", null, 404);
      }

      const user = users[0];
      const data = {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      return ApiResponse.success(data, 200, "User found");
    } catch (err) {
      return ApiResponse.error("Failed to retrieve user", err instanceof Error ? err.message : String(err));
    }
  }
};

