import Repository from "@db/repos/Repository";
import DatabasePool from "@db/DatabasePool";

const REPOSITORIES: Record<string, Repository> = {};

class RepositoryManager {
  static async init() {
    const connection = await DatabasePool.getInstance().getConnection();

    for (const key in REPOSITORIES) {
      await REPOSITORIES[key].init(connection);
    }

    await connection.commit();
    await connection.end();
  }

  static async get(type: string) {
    if (REPOSITORIES.hasOwnProperty(type)) {
      const repo = REPOSITORIES[type].constructor();
      await repo.open();

      return repo;
    }

    throw new Error(`Repository type '${type}' not found`);
  }
}

export default RepositoryManager;
