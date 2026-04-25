import { UploadController } from "../controllers/upload.controller";
import { get, post } from "../middlewares/method.middleware";

export const uploadRoutes = {
  "/api/v2/upload": post(UploadController.uploadFile),
  "/api/v2/uploads/:filename": get((req: any) => UploadController.serveFile(req.params.filename)),
  "/api/v2/test": get(() => new Response(Bun.file("./public/test-upload.html"), {
    headers: { "Content-Type": "text/html" }
  })),
};
