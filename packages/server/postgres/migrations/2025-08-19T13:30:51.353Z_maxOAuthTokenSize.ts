import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  db.schema
    .alterTable('AtlassianAuth')
    .alterColumn('accessToken', (ac) => ac.setDataType('varchar(8192)'))
    .alterColumn('refreshToken', (ac) => ac.setDataType('varchar(8192)'))
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  db.schema
    .alterTable('AtlassianAuth')
    .alterColumn('accessToken', (ac) => ac.setDataType('varchar(2600)'))
    .alterColumn('refreshToken', (ac) => ac.setDataType('varchar(2600)'))
    .execute()
}
