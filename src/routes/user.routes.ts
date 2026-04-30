import type { BunRequest } from "bun";
import { UserController } from "../controllers/user.controller";
import { withLogger } from "../middlewares/logger.middleware";

export const userRoutes = {
  "/api/v2/users": {
    GET: UserController.getAllUsers,
    POST: withLogger(UserController.createUser),
  },
  "/api/v2/users/:id": {
    DELETE: withLogger((req: BunRequest<"/api/v2/delete-user/:id">) => UserController.deleteUser(req, req.params.id)),
  }
};
