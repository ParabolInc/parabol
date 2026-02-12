import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Team')
    // show the group in scim requests even when archived
    .addColumn('scimCreated', 'boolean')
    .execute()

  await db.schema
    .alterTable('User')
    // userName is case-insensitive in SCIM spec, let's signal this in the db type as well
    .alterColumn('scimUserName', (ac) => ac.setDataType(sql`citext`))
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('Team').dropColumn('scimCreated').execute()

  await db.schema
    .alterTable('User')
    .alterColumn('scimUserName', (ac) => ac.setDataType('varchar(255)'))
    .execute()
}
