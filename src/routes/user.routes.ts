import type { BunRequest } from "bun";
import { UserController } from "../controllers/user.controller";
import { get, post, del } from "../middlewares/method.middleware";
import { withLogger } from "../middlewares/logger.middleware";

export const userRoutes = {
  "/api/v2/users": withLogger(get(UserController.getAllUsers)),
  "/api/v2/create-user": withLogger(post(UserController.createUser)),
  "/api/v2/delete-user/:id": withLogger(del((req: BunRequest<"/api/v2/delete-user/:id">) => UserController.deleteUser(req, req.params.id))),
};
