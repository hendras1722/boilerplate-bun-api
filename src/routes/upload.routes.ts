import type { BunRequest } from "bun";
import { UploadController } from "../controllers/upload.controller";
import { get, post } from "../middlewares/method.middleware";
import { withLogger } from "../middlewares/logger.middleware";

export const uploadRoutes = {
  "/api/v2/upload": withLogger(post(UploadController.uploadFile)),
  "/api/v2/uploads/:filename": withLogger(get((req: BunRequest<"/api/v2/uploads/:filename">) => UploadController.serveFile(req.params.filename))),
  "/api/v2/test": withLogger(get(() => new Response(Bun.file("./public/test-upload.html"), {
    headers: { "Content-Type": "text/html" }
  }))),
};
