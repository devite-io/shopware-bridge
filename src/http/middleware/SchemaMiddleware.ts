import Middleware from "@http/middleware/Middleware";
import ApiRoute from "@http/routes/ApiRoute";
import { Context } from "hono";
import { createError } from "@utils/createError";
import validate from "@utils/validate";

class SchemaMiddleware implements Middleware {
  private readonly route: ApiRoute;

  constructor(route: ApiRoute) {
    this.route = route;
  }

  /**
   * @override
   */
  async handleRequest(context: Context, cache: Map<string, any>) {
    const failedProperty = this.testSchema(
      await context.req.json<Record<string, any>>(),
    );

    if (failedProperty)
      return createError(
        context,
        400,
        `"${failedProperty.name}" must be of type "${failedProperty.type}"`,
      );

    return null;
  }

  /**
   * Validates the schema of the route.
   * @returns the failed property or null if the body matches the schema
   */
  testSchema(body: Record<string, any>): { name: string; type: string } | null {
    const { schema } = this.route;

    if (!schema) return null;
    if (!body) return { name: "body", type: "object" };

    for (const key in schema) {
      const { type, required, itemType } = schema[key];
      const value = body[key];

      if (required && (value === null || value === undefined))
        return { name: key, type };

      if (value) {
        if (type === "array") {
          if (!Array.isArray(value)) return { name: key, type: "Array" };
          if (itemType && !value.every((item) => validate(itemType, item)))
            return { name: key, type: `Array<${itemType}>` };
        } else if (!validate(type, value)) return { name: key, type };
      }
    }

    const forbiddenProperty = Object.keys(body).find(
      (key) => !schema.hasOwnProperty(key),
    );

    if (forbiddenProperty)
      return { name: forbiddenProperty, type: "undefined" };

    return null;
  }
}

export default SchemaMiddleware;
