import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('OAuthAPIProvider')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('organizationId', 'text', (col) =>
      col.notNull().references('Organization.id').onDelete('cascade')
    )
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('clientId', 'text', (col) => col.notNull().unique())
    .addColumn('clientSecret', 'text', (col) => col.notNull())
    .addColumn('redirectUris', sql`text[]`, (col) => col.notNull())
    .addColumn('scopes', sql`text[]`, (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createTable('OAuthAPICode')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('clientId', 'text', (col) => col.notNull())
    .addColumn('redirectUri', 'text', (col) => col.notNull())
    .addColumn('userId', 'text', (col) => col.notNull())
    .addColumn('scopes', sql`text[]`, (col) => col.notNull())
    .addColumn('expiresAt', 'timestamptz', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createIndex('idx_oauth_provider_org_id')
    .on('OAuthAPIProvider')
    .column('organizationId')
    .execute()

  await db.schema
    .createIndex('idx_oauth_code_client_id')
    .on('OAuthAPICode')
    .column('clientId')
    .execute()

  await db.schema
    .alterTable('OAuthAPICode')
    .addForeignKeyConstraint('fk_oauth_code_client_id', ['clientId'], 'OAuthAPIProvider', [
      'clientId'
    ])
    .onDelete('cascade')
    .execute()

  await db
    .insertInto('FeatureFlag')
    .values({
      featureName: 'oauthProvider',
      description: 'Whether an organization can configure OAuth 2.0 providers',
      expiresAt: '2025-12-31T23:59:59.999Z',
      scope: 'Organization'
    })
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('FeatureFlag').where('featureName', '=', 'oauthProvider').execute()
  await db.schema.dropIndex('idx_oauth_code_client_id').execute()
  await db.schema.dropTable('OAuthAPICode').execute()
  await db.schema.dropIndex('idx_oauth_provider_org_id').execute()
  await db.schema.dropTable('OAuthAPIProvider').execute()
}
