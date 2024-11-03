import DatabasePool from "@db/DatabasePool";
import mariadb from "mariadb";

abstract class Repository {
  private connection: mariadb.Connection | null = null;

  /**
   * Starts a transaction.
   */
  async open() {
    this.connection = await DatabasePool.getInstance().getConnection();
  }

  /**
   * Performs a query on the database.
   * @throws {Error} if the transaction has not been started
   */
  query(sql: string, ...values: Array<any>) {
    if (!this.connection) throw new Error("Transaction not started");

    return this.connection.query(sql, values);
  }

  /**
   * Completes a transaction.
   * @throws {Error} if the transaction has not been started
   */
  async close() {
    if (!this.connection) throw new Error("Transaction not started");

    await this.connection.commit();
    await this.connection.end();
  }

  abstract init(connection: mariadb.Connection): Promise<void>;

  /**
   * Returns the keys of an object whose values are not 'undefined'.
   * @return the keys
   */
  static definedKeys(object: Record<string, any>): Array<string> {
    return Object.keys(object).filter((key) => object[key] !== undefined);
  }

  /**
   * Returns the values of an object that are not 'undefined'.
   * @return the values
   */
  static definedValues(object: Record<string, any>): Array<any> {
    return this.definedKeys(object).map((key) => object[key]);
  }

  /**
   * Converts an object to a string of columns.
   * @returns the columns
   */
  static toInsertColumns(object: Record<string, any>): string {
    return this.definedKeys(object)
      .map((column) => "`" + column + "`")
      .join(", ");
  }

  /**
   * Converts an object to a list of slot placeholders.
   * @returns the values
   */
  static toInsertPlaceholders(object: Record<string, any>): string {
    return this.definedValues(object)
      .map(() => "?")
      .join(", ");
  }

  /**
   * Converts an object to a string of columns with placeholders for values.
   * @returns the columns
   */
  static toUpdateColumns(object: Record<string, any>): string {
    return this.definedKeys(object)
      .map((column) => "`" + column + "` = ?")
      .join(", ");
  }
}

export default Repository;
