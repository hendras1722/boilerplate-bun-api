import { ApiResponse } from "../utils/response";
import { generateSignedUrl } from "../utils/s3Presign";

export const UploadController = {
  async uploadFile(req: Request) {
    try {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!file || !(file instanceof File)) {
        return ApiResponse.error("No file uploaded or invalid file", null, 400);
      }

      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const filePath = `./uploads/${fileName}`;

      await Bun.write(filePath, file);

      const signedUrl = generateSignedUrl(`/api/v2/uploads/${fileName}`, fileName);

      return ApiResponse.success({
        key: fileName,
        name: file.name,
        size: file.size,
        type: file.type,
        url: signedUrl
      }, 201);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return ApiResponse.error("Upload failed", errorMessage, 500);
    }
  },

  async serveFile(filename: string) {
    const safeName = filename.split(" ").join("-");
    const file = Bun.file(`./uploads/${safeName}`);

    if (!(await file.exists())) {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(file);
  },
  async getURL(key: string) {
    const filePath = `./uploads/${key}`;
    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      return ApiResponse.error("File not found", null, 404);
    }

    const signedUrl = generateSignedUrl(`/api/v2/uploads/${key}`, key);

    return ApiResponse.success({
      url: signedUrl,
      name: key.replace(/\d+-/gm, ''),
      size: file.size,
      type: file.type
    }, 200);
  }
};
