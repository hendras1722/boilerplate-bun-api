export const ApiResponse = {
  success: (data: any, status = 200) => {
    return Response.json(
      {
        status: "success",
        data: data,
      },
      { status }
    );
  },

  error: (message: string, details: any = null, status = 400) => {
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
