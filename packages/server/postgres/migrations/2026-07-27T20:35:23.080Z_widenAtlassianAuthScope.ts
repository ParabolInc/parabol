import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('AtlassianAuth')
    .alterColumn('scope', (ac) => ac.setDataType('varchar(1000)'))
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('AtlassianAuth')
    .alterColumn('scope', (ac) => ac.setDataType('varchar(240)'))
    .execute()
}
