import type { BunRequest } from "bun";

type Handler<T extends string = string> = (req: BunRequest<T>) => Promise<Response> | Response;

const validateMethod = <T extends string>(method: string, handler: Handler<T>) => {
  return async (req: BunRequest<T>) => {
    if (req.method !== method) {
      return Response.json(
        { error: `Method ${req.method} not allowed. Use ${method}` },
        { status: 405 }
      );
    }
    return handler(req);
  };
};

export const get = <T extends string = string>(handler: Handler<T>) => validateMethod("GET", handler);
export const post = <T extends string = string>(handler: Handler<T>) => validateMethod("POST", handler);
export const put = <T extends string = string>(handler: Handler<T>) => validateMethod("PUT", handler);
export const del = <T extends string = string>(handler: Handler<T>) => validateMethod("DELETE", handler);
