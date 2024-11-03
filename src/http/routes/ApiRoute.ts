import Middleware from "@http/middleware/Middleware";
import { Context } from "hono";

abstract class ApiRoute {
  public method: HTTPRequestMethod;
  public path: string;
  public schema: Record<string, any> | null;
  public middleware: Array<Middleware>;

  /**
   * Initializes an API route.
   */
  protected constructor(
    method: HTTPRequestMethod,
    path: string,
    schema: Record<string, any> | null = null,
    ...middleware: Array<Middleware>
  ) {
    this.method = method;
    this.path = path;
    this.schema = schema;
    this.middleware = middleware;
  }

  /**
   * Handles the incoming HTTP request and returns a JSON response.
   * @throws {Error} if the method is not implemented
   */
  abstract handleRequest(
    context: Context,
    body: object | ArrayBuffer,
    cache: Map<String, any>,
  ): Promise<JSONApiResponse | ArrayBuffer>;
}

export default ApiRoute;
