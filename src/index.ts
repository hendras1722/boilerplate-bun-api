import { serve, type BunRequest } from "bun";
import { userRoutes } from "./routes/user.routes";
import { uploadRoutes } from "./routes/upload.routes";
import { logger } from "./middlewares/logger.middleware";
import { ApiResponse } from "./utils/response";
import { parseLog } from "./utils/parseLog";

type RouteHandler = (req: BunRequest) => Response | Promise<Response>;

const withLogger = (handler: RouteHandler) => {
  return async (req: BunRequest) => {
    const logDone = await logger(req);
    try {
      if (handler instanceof Response) {
        await logDone(handler);
        return handler.clone();
      }
      const response = await handler(req);
      await logDone(response);
      return response;
    } catch (err) {
      await logDone(undefined, err);
      return ApiResponse.error(
        "Internal Server Error",
        err instanceof Error ? err.message : String(err),
        500
      );
    }
  };
};

const allRoutes: Record<string, RouteHandler> = {
  "/api/version": () => ApiResponse.success({ version: "v2" }),
  ...userRoutes,
  ...uploadRoutes,
  '/api/logs': async () => {
    const logFile = Bun.file("./app.log");
    const content = await logFile.text();
    const lines = content.trim().split("\n").map(parseLog).filter(Boolean);
    return ApiResponse.success(lines);
  }
};

const routes: any = {};
for (const [path, handler] of Object.entries(allRoutes)) {
  routes[path] = withLogger(handler);
}

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

