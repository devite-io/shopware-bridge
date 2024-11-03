import { Context } from "hono";

interface Middleware {
  /**
   * Handles the incoming HTTP request.
   * @returns the error object or null if successful
   */
  handleRequest(
    context: Context,
    cache: Map<String, any>,
  ): Promise<JSONApiResponse | null>;
}

export default Middleware;
