import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('Team').dropColumn('jiraDimensionFields').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Team')
    .addColumn('jiraDimensionFields', sql`jsonb[]`, (col) =>
      col.defaultTo(sql`'{}'::jsonb[]`).notNull()
    )
    .execute()
}
