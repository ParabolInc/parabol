import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType('OAuthClientTypeEnum').asEnum(['confidential', 'public']).execute()
  await db.schema
    .alterTable('OAuthAPIProvider')
    .addColumn('clientType', sql`"OAuthClientTypeEnum"`, (col) =>
      col.notNull().defaultTo('confidential')
    )
    .execute()
  await db.schema
    .alterTable('OAuthAPIProvider')
    .alterColumn('clientSecret', (col) => col.dropNotNull())
    .execute()
  await sql`
    ALTER TABLE "OAuthAPIProvider"
    ADD CONSTRAINT "OAuthAPIProvider_secret_matches_type"
    CHECK (("clientType" = 'public') = ("clientSecret" IS NULL))
  `.execute(db)
  await db.schema.alterTable('OAuthAPICode').addColumn('resource', 'varchar(2048)').execute()
  await db.schema
    .createTable('OAuthAPIGrant')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('clientId', 'varchar(255)', (col) =>
      col.notNull().references('OAuthAPIProvider.clientId').onDelete('cascade')
    )
    .addColumn('userId', 'varchar(100)', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    .addColumn('scopes', sql`"OAuthScopeEnum"[]`, (col) => col.notNull())
    .addColumn('grantedOrgIds', sql`varchar(100)[]`)
    .addColumn('resource', 'varchar(2048)')
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('lastUsedAt', 'timestamptz')
    .addColumn('revokedAt', 'timestamptz')
    .addUniqueConstraint('OAuthAPIGrant_clientId_userId_key', ['clientId', 'userId'])
    .execute()
  await db.schema
    .createIndex('idx_OAuthAPIGrant_userId')
    .on('OAuthAPIGrant')
    .column('userId')
    .execute()
  await db.schema
    .createTable('OAuthAPIRefreshToken')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('grantId', 'integer', (col) =>
      col.notNull().references('OAuthAPIGrant.id').onDelete('cascade')
    )
    .addColumn('tokenHash', 'varchar(64)', (col) => col.notNull().unique())
    .addColumn('expiresAt', 'timestamptz', (col) => col.notNull())
    .addColumn('rotatedAt', 'timestamptz')
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()
  await db.schema
    .createIndex('idx_OAuthAPIRefreshToken_grantId')
    .on('OAuthAPIRefreshToken')
    .column('grantId')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('OAuthAPIRefreshToken').execute()
  await db.schema.dropTable('OAuthAPIGrant').execute()
  await db.schema.alterTable('OAuthAPICode').dropColumn('resource').execute()
  await db.deleteFrom('OAuthAPIProvider').where('clientType', '=', 'public').execute()
  await sql`
    ALTER TABLE "OAuthAPIProvider" DROP CONSTRAINT "OAuthAPIProvider_secret_matches_type"
  `.execute(db)
  await db.schema
    .alterTable('OAuthAPIProvider')
    .alterColumn('clientSecret', (col) => col.setNotNull())
    .execute()
  await db.schema.alterTable('OAuthAPIProvider').dropColumn('clientType').execute()
  await db.schema.dropType('OAuthClientTypeEnum').execute()
}
