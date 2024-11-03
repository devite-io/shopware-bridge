import { Context } from "hono";
import { StatusCode } from "hono/dist/types/utils/http-status";

/**
 * Sets the response status code and returns an error object.
 */
export function createError(
  context: Context,
  statusCode: StatusCode,
  message: string,
): { success: boolean; message: string } {
  context.status(statusCode);

  return {
    success: false,
    message,
  };
}
