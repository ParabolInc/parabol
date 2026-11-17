import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('AtlassianAuth')
    .alterColumn('scope', (ac) => ac.setDataType('varchar(1000)'))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('AtlassianAuth')
    .alterColumn('scope', (ac) => ac.setDataType('varchar(240)'))
    .execute()
}
