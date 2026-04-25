import type { BunRequest } from "bun";
import { UserController } from "../controllers/user.controller";
import { get, post, del } from "../middlewares/method.middleware";

export const userRoutes = {
  "/api/v2/users": get(UserController.getAllUsers),
  "/api/v2/create-user": post(UserController.createUser),
  "/api/v2/delete-user/:id": del((req: BunRequest<"/api/v2/delete-user/:id">) => UserController.deleteUser(req, req.params.id)),
};
