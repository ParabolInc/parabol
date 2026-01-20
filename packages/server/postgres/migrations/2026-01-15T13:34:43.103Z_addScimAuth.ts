import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('SCIMAuthenticationTypeEnum')
    .asEnum(['bearerToken', 'oauthClientCredentials'])
    .execute()

  await db.schema
    .alterTable('SAML')
    .addColumn('scimAuthenticationType', sql`"SCIMAuthenticationTypeEnum"`)
    .addColumn('scimBearerToken', 'varchar(255)')
    .addColumn('scimOAuthClientId', 'varchar(255)')
    .addColumn('scimOAuthClientSecret', 'varchar(255)')
    .execute()

  await db
    .insertInto('FeatureFlag')
    .values({
      featureName: 'SCIM',
      description: 'Provision organization users via SCIM',
      expiresAt: '2026-11-30T23:59:59.999Z',
      scope: 'Organization'
    })
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('SAML')
    .dropColumn('scimAuthenticationType')
    .dropColumn('scimBearerToken')
    .dropColumn('scimOAuthClientId')
    .dropColumn('scimOAuthClientSecret')
    .execute()
  await db.schema.dropType('SCIMAuthenticationTypeEnum').execute()
  await db.deleteFrom('FeatureFlag').where('featureName', '=', 'SCIM').execute()
}
