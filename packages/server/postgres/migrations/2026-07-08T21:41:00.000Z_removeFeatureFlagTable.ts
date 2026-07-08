import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Feature flag definitions now live in code (see packages/server/utils/featureFlags.ts).
  // FeatureFlagOwner keeps track of grants, but keys them by featureName instead of a FK to
  // the now-removed FeatureFlag table.
  await db.schema.alterTable('FeatureFlagOwner').addColumn('featureName', 'varchar(255)').execute()

  await db
    .updateTable('FeatureFlagOwner')
    .from('FeatureFlag')
    .set((eb) => ({featureName: eb.ref('FeatureFlag.featureName')}))
    .whereRef('FeatureFlagOwner.featureFlagId', '=', 'FeatureFlag.id')
    .execute()

  await db.schema
    .alterTable('FeatureFlagOwner')
    .dropConstraint('FeatureFlagOwner_featureFlagId_fkey')
    .execute()
  await db.schema
    .alterTable('FeatureFlagOwner')
    .dropConstraint('unique_feature_flag_owner_org')
    .execute()
  await db.schema
    .alterTable('FeatureFlagOwner')
    .dropConstraint('unique_feature_flag_owner_team')
    .execute()
  await db.schema
    .alterTable('FeatureFlagOwner')
    .dropConstraint('unique_feature_flag_owner_user')
    .execute()

  await db.schema.alterTable('FeatureFlagOwner').dropColumn('featureFlagId').execute()
  await db.schema
    .alterTable('FeatureFlagOwner')
    .alterColumn('featureName', (ac) => ac.setNotNull())
    .execute()

  await db.schema
    .alterTable('FeatureFlagOwner')
    .addUniqueConstraint('unique_feature_flag_owner_org', ['orgId', 'featureName'])
    .execute()
  await db.schema
    .alterTable('FeatureFlagOwner')
    .addUniqueConstraint('unique_feature_flag_owner_team', ['teamId', 'featureName'])
    .execute()
  await db.schema
    .alterTable('FeatureFlagOwner')
    .addUniqueConstraint('unique_feature_flag_owner_user', ['userId', 'featureName'])
    .execute()

  await db.schema.dropTable('FeatureFlag').execute()
  await db.schema.dropType('FeatureFlagScope').execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.createType('FeatureFlagScope').asEnum(['User', 'Team', 'Organization']).execute()

  await db.schema
    .createTable('FeatureFlag')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('featureName', 'varchar(255)', (col) => col.notNull())
    .addColumn('scope', 'FeatureFlagScope', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('expiresAt', 'timestamptz', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('isPublic', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()

  await db
    .insertInto('FeatureFlag')
    .values([
      {
        featureName: 'oauthProvider',
        scope: 'Organization',
        description: 'Create OAuth 2.0 tokens to execute custom GraphQL queries',
        expiresAt: '2026-11-30T23:59:59.999+00:00',
        isPublic: false
      },
      {
        featureName: 'SCIM',
        scope: 'Organization',
        description: 'Provision organization users via SCIM',
        expiresAt: '2026-11-30T23:59:59.999+00:00',
        isPublic: false
      },
      {
        featureName: 'Databases',
        scope: 'Organization',
        description: 'Experimental databases in pages',
        expiresAt: '2027-03-01T00:00:00+00:00',
        isPublic: true
      }
    ])
    .execute()

  await db.schema.alterTable('FeatureFlagOwner').addColumn('featureFlagId', 'uuid').execute()

  await db
    .updateTable('FeatureFlagOwner')
    .from('FeatureFlag')
    .set((eb) => ({featureFlagId: eb.ref('FeatureFlag.id')}))
    .whereRef('FeatureFlagOwner.featureName', '=', 'FeatureFlag.featureName')
    .execute()

  await db.schema
    .alterTable('FeatureFlagOwner')
    .dropConstraint('unique_feature_flag_owner_org')
    .execute()
  await db.schema
    .alterTable('FeatureFlagOwner')
    .dropConstraint('unique_feature_flag_owner_team')
    .execute()
  await db.schema
    .alterTable('FeatureFlagOwner')
    .dropConstraint('unique_feature_flag_owner_user')
    .execute()

  await db.schema.alterTable('FeatureFlagOwner').dropColumn('featureName').execute()
  await db.schema
    .alterTable('FeatureFlagOwner')
    .alterColumn('featureFlagId', (ac) => ac.setNotNull())
    .execute()

  await db.schema
    .alterTable('FeatureFlagOwner')
    .addForeignKeyConstraint(
      'FeatureFlagOwner_featureFlagId_fkey',
      ['featureFlagId'],
      'FeatureFlag',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute()

  await db.schema
    .alterTable('FeatureFlagOwner')
    .addUniqueConstraint('unique_feature_flag_owner_org', ['orgId', 'featureFlagId'])
    .execute()
  await db.schema
    .alterTable('FeatureFlagOwner')
    .addUniqueConstraint('unique_feature_flag_owner_team', ['teamId', 'featureFlagId'])
    .execute()
  await db.schema
    .alterTable('FeatureFlagOwner')
    .addUniqueConstraint('unique_feature_flag_owner_user', ['userId', 'featureFlagId'])
    .execute()
}
