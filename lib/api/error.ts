import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export type ApiErrorResponse = {
  error: string;
  code: ApiErrorCode;
  requestId?: string;
  details?: Record<string, unknown>;
};

const generateRequestId = (): string =>
  `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

export const apiError = (
  message: string,
  status: number,
  options?: {
    code?: ApiErrorCode;
    requestId?: string;
    details?: Record<string, unknown>;
  }
): NextResponse => {
  const requestId = options?.requestId ?? generateRequestId();
  const body: ApiErrorResponse = {
    error: message,
    code: options?.code ?? "INTERNAL_ERROR",
    requestId,
    ...(options?.details ? { details: options.details } : {}),
  };

  return NextResponse.json(body, { status });
};

export const badRequest = (
  message: string,
  details?: Record<string, unknown>
): NextResponse =>
  apiError(message, 400, { code: "BAD_REQUEST", details });

export const unauthorized = (message = "Unauthorized"): NextResponse =>
  apiError(message, 401, { code: "UNAUTHORIZED" });

export const forbidden = (message = "Forbidden"): NextResponse =>
  apiError(message, 403, { code: "FORBIDDEN" });

export const notFound = (message = "Not found"): NextResponse =>
  apiError(message, 404, { code: "NOT_FOUND" });

export const conflict = (
  message: string,
  details?: Record<string, unknown>
): NextResponse => apiError(message, 409, { code: "CONFLICT", details });

export const validationError = (
  message: string,
  details: Record<string, unknown>
): NextResponse =>
  apiError(message, 400, { code: "VALIDATION_ERROR", details });

export const internalError = (
  message = "Internal server error",
  details?: Record<string, unknown>
): NextResponse =>
  apiError(message, 500, { code: "INTERNAL_ERROR", details });
