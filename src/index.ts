import { serve, type BunRequest } from "bun";
import { userRoutes } from "./routes/user.routes";
import { uploadRoutes } from "./routes/upload.routes";
import { logger, withLogger } from "./middlewares/logger.middleware";
import { ApiResponse } from "./utils/response";
import { parseLog } from "./utils/parseLog";

Bun.cron("1 * * * *", async () => {
  console.log("Cron job executed");
});

const versionResponse = {
  status: "ok",
  message: "pong",
};


const routes = {
  "/api/version": {
    GET: () => ApiResponse.success(versionResponse, 200)
  },
  '/api/logs': {
    GET: withLogger(async (req: BunRequest<'/api/logs'>) => {
      const logFile = Bun.file("./app.log");
      const content = await logFile.text();
      const lines = content.trim().split("\n").map(parseLog).filter(Boolean);
      return ApiResponse.success(lines);
    }),
    DELETE: withLogger(async (req: BunRequest<'/api/logs'>) => {
      Bun.write("./app.log", "");
      return ApiResponse.success("Logs cleared");
    })
  },
  ...userRoutes,
  ...uploadRoutes,
  '/api/*': (req: BunRequest) => {
    return ApiResponse.error("Route not found", { path: new URL(req.url).pathname }, 404)
  }
};

const server = serve({
  port: 3000,
  routes,
  idleTimeout: 10,
  maxRequestBodySize: 1024 * 1024 * 10,
  // async fetch(req) {
  // const logDone = await logger(req);
  // await logDone(res, undefined, "Route not found");
  // const res = ApiResponse.error("Route not found", { path: new URL(req.url).pathname }, 404);
  // return res;
  // },
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

