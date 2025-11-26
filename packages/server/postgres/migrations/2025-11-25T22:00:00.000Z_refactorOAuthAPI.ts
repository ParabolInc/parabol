import {Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // 1. Create OAuthAPIProvider table
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

  // 2. Rename OAuthCode table to OAuthAPICode
  await db.schema.alterTable('OAuthCode').renameTo('OAuthAPICode').execute()

  // 3. Migrate existing data
  // Logic removed as per user request to not create default applications
  /*
  const orgs = await db
    .selectFrom('Organization')
    .select(['id', 'oauthClientId', 'oauthClientSecret', 'oauthRedirectUris', 'oauthScopes'])
    .where('oauthClientId', 'is not', null)
    .execute()
  */

  // 4. Drop old columns from Organization
  await db.schema.alterTable('Organization').dropColumn('oauthClientId').execute()
  await db.schema.alterTable('Organization').dropColumn('oauthClientSecret').execute()
  await db.schema.alterTable('Organization').dropColumn('oauthRedirectUris').execute()
  await db.schema.alterTable('Organization').dropColumn('oauthScopes').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // Revert changes (simplified, data loss on revert is acceptable for dev/staging, but in prod we'd want to be careful)

  // 1. Add columns back to Organization
  await db.schema.alterTable('Organization').addColumn('oauthClientId', 'text').execute()
  await db.schema.alterTable('Organization').addColumn('oauthClientSecret', 'text').execute()
  await db.schema.alterTable('Organization').addColumn('oauthRedirectUris', sql`text[]`).execute()
  await db.schema.alterTable('Organization').addColumn('oauthScopes', sql`text[]`).execute()

  // 2. Migrate data back (taking the first provider found)
  const providers = await db.selectFrom('OAuthAPIProvider').selectAll().execute()
  for (const provider of providers) {
    await db
      .updateTable('Organization')
      .set({
        oauthClientId: provider.clientId,
        oauthClientSecret: provider.clientSecret,
        oauthRedirectUris: provider.redirectUris,
        oauthScopes: provider.scopes
      })
      .where('id', '=', provider.organizationId)
      .execute()
  }

  // 3. Rename table back
  await db.schema.alterTable('OAuthAPICode').renameTo('OAuthCode').execute()

  // 4. Drop OAuthAPIProvider table
  await db.schema.dropTable('OAuthAPIProvider').execute()
}
