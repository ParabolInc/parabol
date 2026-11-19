import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('OAuthAPIProvider').dropColumn('clientSecret').execute()
  await db.deleteFrom('OAuthAPICode').where('codeChallenge', 'is', null).execute()
  await db.schema
    .alterTable('OAuthAPICode')
    .alterColumn('codeChallenge', (col) => col.setNotNull())
    .execute()
  await db.schema.alterTable('OAuthAPICode').addColumn('resource', 'text').execute()
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
    .addColumn('resource', 'text')
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('lastUsedAt', 'timestamptz')
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
    // no foreign key: pruning deletes an expired parent while its children live on, still linked as siblings
    .addColumn('parentId', 'integer')
    .addColumn('tokenHash', 'text', (col) => col.notNull().unique())
    .addColumn('expiresAt', 'timestamptz', (col) => col.notNull())
    .addColumn('rotatedAt', 'timestamptz')
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()
  await db.schema
    .createIndex('idx_OAuthAPIRefreshToken_grantId')
    .on('OAuthAPIRefreshToken')
    .column('grantId')
    .execute()
  await db.schema
    .createIndex('idx_OAuthAPIRefreshToken_parentId')
    .on('OAuthAPIRefreshToken')
    .column('parentId')
    .execute()
  await db.schema
    .createIndex('idx_OAuthAPIRefreshToken_expiresAt')
    .on('OAuthAPIRefreshToken')
    .column('expiresAt')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('OAuthAPIRefreshToken').execute()
  await db.schema.dropTable('OAuthAPIGrant').execute()
  await db.schema.alterTable('OAuthAPICode').dropColumn('resource').execute()
  await db.schema
    .alterTable('OAuthAPICode')
    .alterColumn('codeChallenge', (col) => col.dropNotNull())
    .execute()
  await db.deleteFrom('OAuthAPIProvider').execute()
  await db.schema
    .alterTable('OAuthAPIProvider')
    .addColumn('clientSecret', 'varchar(43)', (col) => col.notNull())
    .execute()
}
