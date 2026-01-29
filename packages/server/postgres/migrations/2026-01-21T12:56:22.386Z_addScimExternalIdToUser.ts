import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  db.schema
    .alterTable('User')
    .addColumn('scimId', 'varchar(255)')
    .addColumn('scimExternalId', 'varchar(255)')
    .addColumn('scimUserName', 'varchar(255)')
    .addColumn('scimUserNameFallback', 'varchar(255)', (col) =>
      col.generatedAlwaysAs(sql`COALESCE("scimUserName", "persistentUserId", "email")`).stored()
    )
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  db.schema
    .alterTable('User')
    .dropColumn('scimId')
    .dropColumn('scimExternalId')
    .dropColumn('scimUserName')
    .dropColumn('scimUserNameFallback')
    .execute()
}
