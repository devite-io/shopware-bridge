import { Context, Hono } from "hono";
import { routes } from "@http/routes";
import ApiRoute from "@http/routes/ApiRoute";
import SchemaMiddleware from "@http/middleware/SchemaMiddleware";

class RequestHandler {
  private honoApp: Hono;

  constructor(honoApp: Hono) {
    this.honoApp = honoApp;
  }

  /**
   * Handles an API request.
   * @returns the response body
   */
  private async handle(context: Context, route: ApiRoute) {
    try {
      const contentType = context.req.header("Content-Type");
      let requestBody;

      if (contentType) {
        requestBody = contentType.includes("application/json")
          ? await context.req.json()
          : await context.req.arrayBuffer();
      } else requestBody = null;

      // process middleware
      const requestCache = new Map();

      for (const middleware of route.middleware) {
        const middlewareResponse = await middleware.handleRequest(context, requestCache);

        if (middlewareResponse) return middlewareResponse;
      }

      // handle request
      return await route.handleRequest(context, requestBody, requestCache);
    } catch (error) {
      console.error(`Failed to handle '${route.method} ${route.path}':`, error);

      context.status(500);

      return {
        success: false,
        message: "Internal Server Error"
      };
    }
  }

  /**
   * Forwards a request to the given route.
   * @returns the response body
   */
  private async forwardToRoute(context: Context, route: ApiRoute): Promise<Response | undefined> {
    const response = await this.handle(context, route);

    if (response.constructor.name === "Object") return context.json(response);
    else if (response.constructor.name === "ArrayBuffer")
      return context.body(response as ArrayBuffer);
  }

  /**
   * Initializes the routes for the given app.
   */
  public initRouting() {
    // register routes
    routes.forEach((route: ApiRoute) => {
      const path = route.path;
      const forwardFunction = async (context: Context) => this.forwardToRoute(context, route);

      switch (route.method) {
        case HTTPRequestMethod.GET:
          this.honoApp.get(path, forwardFunction);
          break;
        case HTTPRequestMethod.POST:
          this.honoApp.post(path, forwardFunction);
          break;
        case HTTPRequestMethod.DELETE:
          this.honoApp.delete(path, forwardFunction);
          break;
        case HTTPRequestMethod.PATCH:
          this.honoApp.patch(path, forwardFunction);
          break;
        case HTTPRequestMethod.PUT:
          this.honoApp.put(path, forwardFunction);
          break;
        case HTTPRequestMethod.OPTIONS:
          this.honoApp.options(path, forwardFunction);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${route.method}`);
      }

      // add middleware
      if (route.schema) route.middleware.unshift(new SchemaMiddleware(route));
    });

    this.honoApp.notFound((context) => {
      context.status(404);

      return context.json({
        success: false,
        message: `the route '${context.req.method + " " + context.req.path}' is not implemented`
      });
    });
  }
}

export default RequestHandler;
