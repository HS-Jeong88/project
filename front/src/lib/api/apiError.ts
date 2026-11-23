export interface ApiErrorResponse {
  success?: boolean;
  code?: string;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly errors?: ApiErrorResponse["errors"];

  constructor(status: number, message: string, code?: string, errors?: ApiErrorResponse["errors"]) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}
