import { Context, Hono } from "hono";
import { routes } from "@http/routes";
import ApiRoute from "@http/routes/ApiRoute";
import SchemaMiddleware from "@http/middleware/SchemaMiddleware";

/**
 * Handles an API request.
 * @returns the response body
 */
async function handle(context: Context, route: ApiRoute) {
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
      const middlewareResponse = await middleware.handleRequest(
        context,
        requestCache,
      );

      if (middlewareResponse) return middlewareResponse;
    }

    // handle request
    return await route.handleRequest(context, requestBody, requestCache);
  } catch (error) {
    console.error(`Failed to handle '${route.method} ${route.path}':`, error);

    context.status(500);

    return {
      success: false,
      message: "Internal Server Error",
    };
  }
}

/**
 * Initializes the routes for the given app.
 * @param {import('hono').Hono} app
 */
function init(app: Hono) {
  // register routes
  routes.forEach((route: ApiRoute) => {
    const path = route.path;

    async function forwardToRoute(
      context: Context,
    ): Promise<Response | undefined> {
      const response = await handle(context, route);

      if (response.constructor.name === "Object") return context.json(response);
      else if (response.constructor.name === "ArrayBuffer")
        return context.body(response as ArrayBuffer);
    }

    switch (route.method) {
      case "POST":
        app.post(path, forwardToRoute);
        break;
      case "DELETE":
        app.delete(path, forwardToRoute);
        break;
      case "PUT":
        app.put(path, forwardToRoute);
        break;
      case "PATCH":
        app.patch(path, forwardToRoute);
        break;
      default:
        app.get(path, forwardToRoute);
        break;
    }

    // add middleware
    if (route.schema) route.middleware.unshift(new SchemaMiddleware(route));
  });

  app.notFound((context) => {
    context.status(404);

    return context.json({
      success: false,
      message: `the route '${context.req.method + " " + context.req.path}' is not implemented`,
    });
  });
}

export default {
  init,
};
