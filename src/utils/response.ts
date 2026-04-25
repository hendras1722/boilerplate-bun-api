export const ApiResponse = {
  success: <T>(data: T, status = 200) => {
    return Response.json(
      {
        status: "success",
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
