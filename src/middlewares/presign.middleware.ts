import { ApiResponse } from "../utils/response";
import { verifySignature } from "../utils/s3Presign";

export const withPresign = <Req extends Request, Res extends Response | Promise<Response>>(handler: (req: Req) => Res) => {
  return async (req: Req): Promise<Response> => {
    const url = new URL(req.url);
    const expires = url.searchParams.get("expires");
    const signature = url.searchParams.get("signature");

    // We need to get the filename from the path.
    // In this app, the route is usually /api/v2/uploads/:filename
    const pathParts = url.pathname.split("/");
    const filename = pathParts[pathParts.length - 1];

    if (!expires || !signature) {
      return ApiResponse.error("Access denied: Missing expiration or signature", null, 403);
    }

    const isValid = verifySignature(filename ?? '', expires, signature);

    if (!isValid) {
      return ApiResponse.error("Access denied: Invalid or expired signature", null, 403);
    }

    return await handler(req);
  };
};
