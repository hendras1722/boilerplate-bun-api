import { serve, type BunRequest } from "bun";
import { userRoutes } from "./routes/user.routes";
import { uploadRoutes } from "./routes/upload.routes";
import { logger, withLogger } from "./middlewares/logger.middleware";
import { ApiResponse } from "./utils/response";
import { parseLog } from "./utils/parseLog";

const routes = {
  "/api/version": withLogger(async (req: BunRequest<"/api/version">) => ApiResponse.success({ version: "v2" })),
  '/api/logs': withLogger(async (req: BunRequest<'/api/logs'>) => {
    const logFile = Bun.file("./app.log");
    const content = await logFile.text();
    const lines = content.trim().split("\n").map(parseLog).filter(Boolean);
    return ApiResponse.success(lines);
  }),
  ...userRoutes,
  ...uploadRoutes
};

const server = serve({
  port: 3000,
  routes,
  async fetch(req) {
    const logDone = await logger(req);
    const res = ApiResponse.error("Route not found", { path: new URL(req.url).pathname }, 404);
    await logDone(res, undefined, "Route not found");
    return res;
  },
  error: (error) => {
    console.error(error);
    return ApiResponse.error("Global error", error.message, 500);
  }
});

// server.reload({
//   routes: {
//     "/api/version": () => Response.json({ version: "3.0.0" }),
//   },
// });

console.log(`🚀 Server running at http://localhost:${server.port}`);

