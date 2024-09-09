import {Kysely, PostgresDialect, sql} from 'kysely'
import getPg from '../getPg'

export async function up() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  await sql`
  ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "favoriteTemplateIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
`.execute(pg)
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  await sql`
  ALTER TABLE "User"
  DROP COLUMN "favoriteTemplateIds";
`.execute(pg)
}
