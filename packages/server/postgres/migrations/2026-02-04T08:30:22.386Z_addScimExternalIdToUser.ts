import {type Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('User')
    .addColumn('scimId', 'varchar(100)', (col) => col.references('SAML.id').onDelete('set null'))
    .addColumn('scimExternalId', 'varchar(255)')
    .addColumn('scimUserName', 'varchar(255)')
    // Okta wants these
    .addColumn('scimGivenName', 'varchar(255)')
    .addColumn('scimFamilyName', 'varchar(255)')
    .execute()
  await db.schema
    .createIndex('User_scimId_scimUserName_idx')
    .unique()
    .on('User')
    .columns(['scimId', 'scimUserName'])
    .where('scimId', 'is not', null)
    .where('scimUserName', 'is not', null)
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('User_scimId_scimUserName_idx').execute()
  await db.schema
    .alterTable('User')
    .dropColumn('scimId')
    .dropColumn('scimExternalId')
    .dropColumn('scimUserName')
    .dropColumn('scimGivenName')
    .dropColumn('scimFamilyName')
    .execute()
}
