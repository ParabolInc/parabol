import {Kysely, PostgresDialect, sql} from 'kysely'
import getPg from '../getPg'

export async function up() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  await sql`
  ALTER TABLE "IntegrationProvider"
    ADD COLUMN "orgId" VARCHAR(100),
    ALTER COLUMN "teamId" DROP NOT NULL,
    ADD CONSTRAINT "team_id_scope_check"
      CHECK ("teamId" IS NOT NULL OR "scope" != 'team'),
    ADD CONSTRAINT "org_id_scope_check"
      CHECK ("orgId" IS NOT NULL OR "scope" != 'org');
`.execute(pg)
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  await sql`
  ALTER TABLE "IntegrationProvider"
    DROP COLUMN "orgId",
    ALTER COLUMN "teamId" SET NOT NULL,
    DROP CONSTRAINT IF EXISTS "team_id_scope_check",
    DROP CONSTRAINT IF EXISTS "org_id_scope_check";
`.execute(pg)
}
