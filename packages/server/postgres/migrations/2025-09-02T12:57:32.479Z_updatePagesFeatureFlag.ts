import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  const existingFeatureFlag = await db
    .selectFrom('FeatureFlag')
    .select('id')
    .where('featureName', '=', 'Pages')
    .where('scope', '=', 'User')
    .executeTakeFirstOrThrow()

  const featureFlag = await db
    .insertInto('FeatureFlag')
    .values({
      featureName: 'Pages',
      description: 'Block editors scoped to the user with RBAC sharing',
      expiresAt: new Date('2026-01-01'),
      scope: 'Organization'
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  const featureFlagId = featureFlag.id

  await db
    .insertInto('FeatureFlagOwner')
    .columns(['featureFlagId', 'orgId'])
    .expression((eb) =>
      eb
        .selectFrom('FeatureFlagOwner')
        .innerJoin('OrganizationUser', 'FeatureFlagOwner.userId', 'OrganizationUser.userId')
        .select((eb) => [eb.val(featureFlagId).as('featureFlagId'), 'OrganizationUser.orgId'])
        .distinct()
        .where('featureFlagId', '=', existingFeatureFlag.id)
    )
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('FeatureFlag')
    .where('featureName', '=', 'Pages')
    .where('scope', '=', 'Organization')
    .execute()
}
