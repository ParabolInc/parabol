import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('TaskEstimate').addColumn('gitlabLabelId', 'varchar(100)').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('TaskEstimate').dropColumn('gitlabLabelId').execute()
}
