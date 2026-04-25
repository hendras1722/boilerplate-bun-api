import type { BunRequest } from "bun";
import { sql } from "../database/sqlite";
import type { User, CreateUserInput } from "../models/user.model";
import { ApiResponse } from "../utils/response";

export const UserController = {
  async getAllUsers() {
    const users = await sql<User[]>`SELECT * FROM users`;
    return ApiResponse.success(users);
  },

  async createUser(req: BunRequest<"/api/v2/create-user">) {
    try {
      const data = await req.json() as CreateUserInput;
      const [user] = await sql<User[]>`
        INSERT INTO users ${sql(data)}
        RETURNING *
      `;
      return ApiResponse.success(user, 201);
    } catch (err) {
      return ApiResponse.error("Failed to create user", err instanceof Error ? err.message : String(err));
    }
  },

  async deleteUser(req: BunRequest<"/api/v2/delete-user/:id">, id: string) {
    if (!id) {
      return ApiResponse.error("Missing id parameter", null, 400);
    }
    await sql`DELETE FROM users WHERE id = ${id}`;
    return ApiResponse.success({ message: 'User deleted successfully', id });
  }
};
