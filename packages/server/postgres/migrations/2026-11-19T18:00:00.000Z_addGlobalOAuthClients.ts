import {type Kysely, sql} from 'kysely'

const aiAppScopes = [
  'meetings:read',
  'meetings:write',
  'tasks:read',
  'tasks:write',
  'pages:read',
  'pages:write',
  'comments:read',
  'comments:write',
  'templates:read',
  'templates:write',
  'teams:read',
  'reports:read',
  'users:read',
  'orgs:read'
]

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE TYPE "OrgAIAppsPolicyEnum" AS ENUM ('all', 'verified', 'none')`.execute(db)
  await db.schema
    .alterTable('Organization')
    .addColumn('aiAppsPolicy', sql`"OrgAIAppsPolicyEnum"`)
    .execute()
  await db.schema
    .alterTable('OAuthAPIProvider')
    .alterColumn('orgId', (col) => col.dropNotNull())
    .execute()
  await db.schema.alterTable('OAuthAPIProvider').addColumn('verifiedAt', 'timestamptz').execute()
  await db.schema
    .alterTable('OAuthAPIGrant')
    .addColumn('personalGrantedAt', 'timestamptz')
    .execute()
  await db.schema
    .alterTable('OAuthAPICode')
    .addColumn('grantedOrgIds', sql`varchar(100)[]`)
    .addColumn('personalGrantedAt', 'timestamptz')
    .execute()
  const globalClient = {
    clientType: 'public',
    clientSecret: null,
    orgId: null,
    scopes: aiAppScopes,
    verifiedAt: sql`now()`
  }
  await db
    .insertInto('OAuthAPIProvider')
    .values([
      {
        ...globalClient,
        clientId: 'https://claude.ai/oauth/mcp-oauth-client-metadata',
        name: 'Claude',
        redirectUris: ['https://claude.ai/api/mcp/auth_callback']
      },
      {
        ...globalClient,
        clientId: 'https://chatgpt.com/oauth/client.json',
        name: 'ChatGPT',
        redirectUris: ['https://chatgpt.com/connector_platform_oauth_redirect']
      }
    ])
    .onConflict((oc) => oc.column('clientId').doNothing())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('OAuthAPIProvider').where('orgId', 'is', null).execute()
  await db.schema
    .alterTable('OAuthAPICode')
    .dropColumn('personalGrantedAt')
    .dropColumn('grantedOrgIds')
    .execute()
  await db.schema.alterTable('OAuthAPIGrant').dropColumn('personalGrantedAt').execute()
  await db.schema.alterTable('OAuthAPIProvider').dropColumn('verifiedAt').execute()
  await db.schema
    .alterTable('OAuthAPIProvider')
    .alterColumn('orgId', (col) => col.setNotNull())
    .execute()
  await db.schema.alterTable('Organization').dropColumn('aiAppsPolicy').execute()
  await sql`DROP TYPE "OrgAIAppsPolicyEnum"`.execute(db)
}
