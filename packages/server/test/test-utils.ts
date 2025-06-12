import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.test') });

export async function clearDatabase(dataSource: DataSource) {
  const entities = dataSource.entityMetadatas;

  try {
    await dataSource.query('SET session_replication_role = replica;');

    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
    }
  } finally {
    await dataSource.query('SET session_replication_role = DEFAULT;');
  }
}
