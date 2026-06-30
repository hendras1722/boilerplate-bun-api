export const ApiResponse = {
  success: <T>(data: T, status = 200, message: string = "ok") => {
    return Response.json(
      {
        status: "success",
        message,
        data: data,
      },
      { status }
    );
  },

  error: <T = unknown>(message: string, details: T | null = null, status = 400) => {
    return Response.json(
      {
        status: "error",
        error: {
          message,
          details,
        },
      },
      { status }
    );
  },
};
