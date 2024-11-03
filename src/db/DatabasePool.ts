import dotenv from "dotenv";
import mariadb from "mariadb";

class DatabasePool {
  static #instance: DatabasePool;

  /**
   * Returns the singleton instance of the DatabasePool.
   * @returns the instance
   */
  static getInstance(): DatabasePool {
    if (!this.#instance) {
      this.#instance = new DatabasePool();
    }

    return this.#instance;
  }

  private dbPool: mariadb.Pool | null;

  constructor() {
    const env = dotenv.config().parsed;

    if (!env) {
      throw new Error("Environment variables not found");
    }

    this.dbPool = mariadb.createPool({
      host: env.DB_HOST ?? "localhost",
      port: parseInt(env.DB_PORT ?? 3306),
      user: env.DB_USER ?? "root",
      password: env.DB_PASSWORD ?? "",
      database: env.DB_NAME,
      connectionLimit: 100,
    });
  }

  /**
   * Starts a new database connection.
   * @returns the connection
   * @throws {Error} if the database pool has not been initialized
   */
  async getConnection(): Promise<mariadb.Connection> {
    if (!this.dbPool) {
      throw new Error("Database pool not initialized");
    }

    return await this.dbPool.getConnection();
  }

  /**
   * Ends all database connections.
   */
  async end() {
    if (!this.dbPool) return;

    await this.dbPool.end();

    this.dbPool = null;
  }
}

export default DatabasePool;
