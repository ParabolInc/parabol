import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('OAuthCode')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('clientId', 'text', (col) => col.notNull())
    .addColumn('redirectUri', 'text', (col) => col.notNull())
    .addColumn('userId', 'text', (col) => col.notNull())
    .addColumn('scopes', sql`text[]`, (col) => col.notNull())
    .addColumn('expiresAt', 'bigint', (col) => col.notNull())
    .addColumn('createdAt', 'bigint', (col) => col.notNull())
    .execute()

  await db.schema
    .alterTable('Organization')
    .addColumn('oauthClientId', 'text')
    .addColumn('oauthClientSecret', 'text')
    .addColumn('oauthRedirectUri', 'text')
    .addColumn('oauthScopes', sql`text[]`)
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('OAuthCode').execute()

  await db.schema
    .alterTable('Organization')
    .dropColumn('oauthClientId')
    .dropColumn('oauthClientSecret')
    .dropColumn('oauthRedirectUri')
    .dropColumn('oauthScopes')
    .execute()
}
