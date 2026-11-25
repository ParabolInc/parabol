import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  for (const table of ['OAuthAPICode', 'OAuthAPIGrant']) {
    await db.schema
      .alterTable(table)
      .addColumn('grantedOrgIds', sql`text[]`)
      .addColumn('grantedTeamIds', sql`text[]`)
      .addColumn('grantedPageIds', sql`text[]`)
      .execute()
  }
  // a connection made through an org's app keeps only the access that app allowed it
  await sql`
    UPDATE "OAuthAPIGrant" AS g
    SET "grantedOrgIds" = ARRAY[p."orgId"::text],
      "grantedTeamIds" = '{}',
      "scopes" = ARRAY(SELECT unnest(g."scopes") INTERSECT SELECT unnest(p."scopes"))
    FROM "OAuthAPIProvider" AS p
    WHERE p."clientId" = g."clientId"
  `.execute(db)
  await db.deleteFrom('OAuthAPICode').execute()
  await db.schema.alterTable('OAuthAPIProvider').dropColumn('orgId').dropColumn('scopes').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('OAuthAPIProvider').execute()
  await db.schema
    .alterTable('OAuthAPIProvider')
    .addColumn('orgId', 'varchar(100)', (col) =>
      col.notNull().references('Organization.id').onDelete('cascade')
    )
    .addColumn('scopes', sql`"OAuthScopeEnum"[]`, (col) => col.notNull())
    .execute()
  await db.schema
    .createIndex('idx_OAuthAPIProvider_orgId')
    .on('OAuthAPIProvider')
    .column('orgId')
    .execute()
  for (const table of ['OAuthAPICode', 'OAuthAPIGrant']) {
    await db.schema
      .alterTable(table)
      .dropColumn('grantedOrgIds')
      .dropColumn('grantedTeamIds')
      .dropColumn('grantedPageIds')
      .execute()
  }
}
