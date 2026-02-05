import {type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('UserDetail')
    .addColumn('id', 'varchar(100)', (col) =>
      col.primaryKey().references('User.id').onDelete('cascade')
    )
    .addColumn('bytesUploaded', 'bigint', (col) => col.defaultTo(0).notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('UserDetail').execute()
}
