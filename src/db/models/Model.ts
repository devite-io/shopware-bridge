abstract class Model {
  /**
   * Updates the model with the given object.
   * @param {Object} object
   */
  update(object: Record<string, any>) {
    Object.keys(object)
      .filter((key) => object[key] !== undefined)
      .forEach((key) => {
        (this as Record<string, any>)[key] = object[key];
      });
  }

  /**
   * Serializes the model to be stored in the database.
   */
  abstract serialize(): object;

  /**
   * Serializes the model to be sent to the client.
   */
  serializeClient() {
    return this.serialize();
  }

  /**
   * Deserializes a model object from the database.
   */
  static deserialize(dbModel: object): Model {
    throw new Error("Not implemented");
  }
}

export default Model;
