import {sql, type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('Page')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('userId', 'varchar(100)', (col) =>
      col.references('User.id').onDelete('cascade').notNull()
    )
    .addColumn('yDoc', 'bytea')
    .addColumn('title', 'varchar(255)')
    .addColumn('plaintextContent', 'text')
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updatedAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute()

  await sql`
    CREATE TRIGGER "update_Page_updatedAt"
    BEFORE UPDATE ON "Page"
    FOR EACH ROW EXECUTE FUNCTION "set_updatedAt"();`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('Page').cascade().execute()
}
