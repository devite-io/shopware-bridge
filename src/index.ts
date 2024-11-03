import DatabasePool from "@db/DatabasePool";
import RepositoryManager from "@db/RepositoryManager";
import HTTPServer from "@http/HTTPServer";

/**
 * Shuts down the application.
 */
async function shutdown() {
  try {
    await HTTPServer.stop();
    await DatabasePool.getInstance().end();
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Initialize the database and start the servers
RepositoryManager.init().then(HTTPServer.start);
