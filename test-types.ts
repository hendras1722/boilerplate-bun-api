import { serve, type BunRequest } from "bun";
serve({
  routes: {
    "/api/:id": (req: BunRequest<"/api/:id">) => new Response(req.params.id)
  }
});
