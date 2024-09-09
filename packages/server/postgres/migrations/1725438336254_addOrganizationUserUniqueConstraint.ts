import {Kysely, PostgresDialect, sql} from 'kysely'
import getPg from '../getPg'

export async function up() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  // get rid of duplicates
  // no kysely here, because I tested the SQL directly and don't want to touch it
  await sql`
    DELETE FROM "OrganizationUser" d USING "OrganizationUser" k
    WHERE d."userId" = k."userId"
      AND d."orgId" = k."orgId"
      AND (
        -- keep non-removed over removed
        (k."removedAt" IS NULL AND d."removedAt" IS NOT NULL)
        -- or removed later
        OR (k."removedAt" IS NOT NULL
           AND d."removedAt" IS NOT NULL
           AND (k."removedAt" > d."removedAt"
               OR ((k."removedAt" = d."removedAt") AND k.id > d.id)
           )
        )
        -- or newer non-removed
        OR (k."removedAt" IS NULL AND d."removedAt" IS NULL AND k.id > d.id)
      );
  `.execute(pg)

  await pg.schema
    .alterTable('OrganizationUser')
    .addUniqueConstraint('unique_org_user', ['orgId', 'userId'])
    .execute()
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await pg.schema.alterTable('OrganizationUser').dropConstraint('unique_org_user').execute()
}
