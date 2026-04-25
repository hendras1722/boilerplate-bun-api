type Handler = (req: any) => Promise<Response> | Response;

const validateMethod = (method: string, handler: Handler) => {
  return async (req: Request) => {
    if (req.method !== method) {
      return Response.json(
        { error: `Method ${req.method} not allowed. Use ${method}` },
        { status: 405 }
      );
    }
    return handler(req);
  };
};

export const get = (handler: Handler) => validateMethod("GET", handler);
export const post = (handler: Handler) => validateMethod("POST", handler);
export const put = (handler: Handler) => validateMethod("PUT", handler);
export const del = (handler: Handler) => validateMethod("DELETE", handler);
