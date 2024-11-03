/**
 * Validate a value against a schema.
 * @returns whether the value matches the schema
 */
export default function validate(schema: string, value: any): boolean {
  if (schema && !value) return false;

  switch (schema) {
    case "number":
      return typeof value === "number"
        ? value - value === 0
        : typeof value === "string" && value.trim() !== ""
          ? Number.isFinite(+value)
          : false;
    case "email":
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    case "phone":
      return /^\+?[0-9]{9,13}$/.test(value);
    case "object":
      return value.constructor?.name === "Object";
    case "string":
      return typeof value === "string";
    case "boolean":
      return value === true || value === false;
    case "date":
      return /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$/.test(
        value,
      );
    default:
      break;
  }

  return true;
}
