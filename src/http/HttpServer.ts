import { serve, ServerType } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import dotenv from "dotenv";
import RequestHandler from "@http/RequestHandler";

class HttpServer {
  private httpServer: ServerType | null = null;
  private requestHandler: RequestHandler | null = null;

  /**
   * Starts the HTTP server.
   * @throws {Error} if environment variables are not set
   */
  public start() {
    const env = dotenv.config().parsed;

    if (!env) {
      throw new Error("Environment variables are not set");
    }

    const honoApp = new Hono();
    honoApp.use(cors());

    this.requestHandler = new RequestHandler(honoApp);
    this.requestHandler.initRouting();

    this.httpServer = serve({
      fetch: honoApp.fetch,
      port: parseInt(env.HTTP_PORT)
    });

    console.log(`HTTP server listens on port ${env.HTTP_PORT}`);
  }

  /**
   * Stops the HTTP server.
   */
  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.httpServer) {
        resolve();
        return;
      }

      this.httpServer.close((error) => {
        if (error) reject(error);
        else resolve();
      });
      this.httpServer = null;
    });
  }
}

export default HttpServer;
