import { serve, ServerType } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import dotenv from "dotenv";
import RequestHandler from "@http/RequestHandler";

class HTTPServer {
  static httpServer: ServerType | null = null;

  /**
   * Starts the HTTP server.
   * @throws {Error} if environment variables are not set
   */
  static start() {
    const env = dotenv.config().parsed;

    if (!env) {
      throw new Error("Environment variables are not set");
    }

    const honoApp = new Hono();
    honoApp.use(cors());

    RequestHandler.init(honoApp);

    HTTPServer.httpServer = serve({
      fetch: honoApp.fetch,
      port: parseInt(env.HTTP_PORT),
    });

    console.log(`HTTP server listens on port ${env.HTTP_PORT}`);
  }

  /**
   * Stops the HTTP server.
   */
  static async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!HTTPServer.httpServer) {
        resolve();
        return;
      }

      HTTPServer.httpServer.close((error) => {
        if (error) reject(error);
        else resolve();
      });
      HTTPServer.httpServer = null;
    });
  }
}

export default HTTPServer;
