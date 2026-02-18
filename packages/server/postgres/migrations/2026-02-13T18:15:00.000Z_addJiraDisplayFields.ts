import {Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('Team').addColumn('jiraDisplayFieldIds', sql`text[]`).execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('Team').dropColumn('jiraDisplayFieldIds').execute()
}
