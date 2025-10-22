// Define the shape of error responses
export type ErrorResponse = {
  error: string;
};

// Define the shape of successful responses
export type SuccessResponse<T> = {
  data: T;
};

// HTTP status codes we use throughout the application
// Having these as constants makes it easier to maintain consistency
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  TEMPORARY_REDIRECT: 307,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Type for HTTP status codes
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];