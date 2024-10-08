import {Kysely, PostgresDialect, sql} from 'kysely'
import getPg from '../getPg'

export async function up() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  const FIFTY_YEARS_FROM_NOW = new Date(Date.now() + 50 * 365 * 24 * 60 * 60 * 1000)

  await pg.transaction().execute(async (trx) => {
    const insertResult = await trx
      .insertInto('FeatureFlag')
      .values({
        featureName: 'noAISummary',
        scope: 'Organization',
        description: 'Disables AI summary feature',
        expiresAt: FIFTY_YEARS_FROM_NOW
      })
      .returning('id')
      .executeTakeFirstOrThrow()

    const featureFlagId = insertResult.id

    await sql`
      INSERT INTO "FeatureFlagOwner" ("featureFlagId", "orgId")
      SELECT ${featureFlagId} AS "featureFlagId", "id" AS "orgId"
      FROM "Organization"
      WHERE "featureFlags" @> ARRAY['noAISummary']::text[];
    `.execute(trx)

    await sql`
      INSERT INTO "FeatureFlagOwner" ("featureFlagId", "orgId")
      SELECT DISTINCT ON ("OrganizationUser"."orgId")
        ${featureFlagId} AS "featureFlagId",
        "OrganizationUser"."orgId" AS "orgId"
      FROM "User"
      INNER JOIN "OrganizationUser" ON "OrganizationUser"."userId" = "User"."id"
      WHERE "User"."featureFlags" @> ARRAY['noAISummary']::varchar(50)[]
      ON CONFLICT ("featureFlagId", "orgId") DO NOTHING;
    `.execute(trx)
  })
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  await pg.transaction().execute(async (trx) => {
    await trx
      .deleteFrom('FeatureFlagOwner')
      .using('FeatureFlag')
      .where('FeatureFlagOwner.featureFlagId', '=', sql.ref('FeatureFlag.id'))
      .where('FeatureFlag.featureName', '=', 'noAISummary')
      .execute()

    await trx.deleteFrom('FeatureFlag').where('featureName', '=', 'noAISummary').execute()
  })
}
