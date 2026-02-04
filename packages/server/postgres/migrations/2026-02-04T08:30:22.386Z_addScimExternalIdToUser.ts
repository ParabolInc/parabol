import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  db.schema
    .alterTable('User')
    .addColumn('scimId', 'varchar(100)', (col) => col.references('SAML.id').onDelete('set null'))
    .addColumn('scimExternalId', 'varchar(255)')
    .addColumn('scimUserName', 'varchar(255)')
    // fallback for existing users not provisioned via SCIM
    .addColumn('scimUserNameFallback', 'varchar(255)', (col) =>
      col.generatedAlwaysAs(sql`COALESCE("scimUserName", "persistentUserId", "email")`).stored()
    )
    // Okta wants these
    .addColumn('scimGivenName', 'varchar(255)')
    .addColumn('scimFamilyName', 'varchar(255)')
    .execute()
  db.schema
    .alterTable('User')
    .addUniqueConstraint('User_scimId_scimUserName_key', ['scimId', 'scimUserName'])
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  db.schema.alterTable('User').dropConstraint('User_scimId_scimUserName_key').execute()
  db.schema
    .alterTable('User')
    .dropColumn('scimId')
    .dropColumn('scimExternalId')
    .dropColumn('scimUserNameFallback')
    .dropColumn('scimUserName')
    .dropColumn('scimGivenName')
    .dropColumn('scimFamilyName')
    .execute()
}
