import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('OAuthScopeEnum')
    .asEnum(['graphql:query', 'graphql:mutation'])
    .execute()

  await db.schema
    .createTable('OAuthAPIProvider')
    .addColumn('id', 'varchar(100)', (col) => col.primaryKey())
    .addColumn('orgId', 'text', (col) =>
      col.notNull().references('Organization.id').onDelete('cascade')
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('clientId', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('clientSecret', 'varchar(43)', (col) => col.notNull())
    .addColumn('redirectUris', sql`text[]`, (col) => col.notNull())
    .addColumn('scopes', sql`"OAuthScopeEnum"[]`, (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await sql`
    CREATE TRIGGER update_oauth_api_provider_updated_at
    BEFORE UPDATE ON "OAuthAPIProvider"
    FOR EACH ROW
    EXECUTE FUNCTION "set_updatedAt"();
  `.execute(db)

  await db.schema
    .createIndex('idx_oauth_provider_org_id')
    .on('OAuthAPIProvider')
    .column('orgId')
    .execute()

  await db.schema
    .createTable('OAuthAPICode')
    .addColumn('id', 'varchar(100)', (col) => col.primaryKey())
    .addColumn('clientId', 'varchar(255)', (col) =>
      col.notNull().references('OAuthAPIProvider.clientId').onDelete('cascade')
    )
    .addColumn('redirectUri', 'text', (col) => col.notNull())
    .addColumn('userId', 'varchar(100)', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    .addColumn('scopes', sql`"OAuthScopeEnum"[]`, (col) => col.notNull())
    .addColumn('expiresAt', 'timestamptz', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createIndex('idx_oauth_code_client_id')
    .on('OAuthAPICode')
    .column('clientId')
    .execute()

  await db
    .insertInto('FeatureFlag')
    .values({
      featureName: 'oauthProvider',
      description: 'Whether an organization can configure OAuth 2.0 providers',
      expiresAt: '2026-11-30T23:59:59.999Z',
      scope: 'Organization'
    })
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('FeatureFlag').where('featureName', '=', 'oauthProvider').execute()
  await db.schema.dropTable('OAuthAPICode').execute()
  await db.schema.dropTable('OAuthAPIProvider').execute()
  await db.schema.dropType('OAuthScopeEnum').execute()
}
