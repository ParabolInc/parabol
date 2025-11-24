import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Organization')
    .dropColumn('oauthRedirectUri')
    .addColumn('oauthRedirectUris', sql`text[]`)
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Organization')
    .dropColumn('oauthRedirectUris')
    .addColumn('oauthRedirectUri', 'text')
    .execute()
}
