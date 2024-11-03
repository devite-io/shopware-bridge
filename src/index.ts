import DatabasePool from "@db/DatabasePool";
import RepositoryManager from "@db/RepositoryManager";
import HttpServer from "@http/HttpServer";

const httpServer = new HttpServer();

/**
 * Shuts down the application.
 */
async function shutdown() {
  try {
    await httpServer.stop();
    await DatabasePool.getInstance().end();
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Initialize the database and start the servers
RepositoryManager.init().then(httpServer.start);
