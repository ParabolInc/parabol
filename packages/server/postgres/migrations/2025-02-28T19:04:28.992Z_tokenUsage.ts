import {sql, type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('AIRequest')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('userId', 'varchar(100)', (col) => col.notNull())
    .addColumn('tokenCost', 'integer', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute()

  await db.schema
    .createIndex('idx_AIRequest_userId_createdAt')
    .on('AIRequest')
    .columns(['userId', 'createdAt'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('AIRequest').execute()
}
