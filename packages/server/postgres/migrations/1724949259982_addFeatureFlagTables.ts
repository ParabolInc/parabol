import {Kysely, PostgresDialect, sql} from 'kysely'
import getPg from '../getPg'

export async function up() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  await pg.schema
    .createTable('FeatureFlag')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('featureName', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('expiresAt', 'timestamptz', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addUniqueConstraint('unique_featureName', ['featureName'])
    .execute()

  await pg.schema
    .createTable('FeatureFlagOwner')
    .ifNotExists()
    .addColumn('featureFlagId', 'uuid', (col) =>
      col.notNull().references('FeatureFlag.id').onDelete('cascade')
    )
    .addColumn('userId', 'varchar(255)', (col) => col.references('User.id').onDelete('cascade'))
    .addColumn('teamId', 'varchar(255)', (col) => col.references('Team.id').onDelete('cascade'))
    .addColumn('orgId', 'varchar(255)', (col) =>
      col.references('Organization.id').onDelete('cascade')
    )
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addCheckConstraint(
      'check_feature_flag_owner_exclusivity',
      sql`
      (("userId" IS NOT NULL AND "teamId" IS NULL AND "orgId" IS NULL) OR
       ("userId" IS NULL AND "teamId" IS NOT NULL AND "orgId" IS NULL) OR
       ("userId" IS NULL AND "teamId" IS NULL AND "orgId" IS NOT NULL))
    `
    )
    .addUniqueConstraint('unique_feature_flag_owner_user', ['userId', 'featureFlagId'])
    .addUniqueConstraint('unique_feature_flag_owner_team', ['teamId', 'featureFlagId'])
    .addUniqueConstraint('unique_feature_flag_owner_org', ['orgId', 'featureFlagId'])
    .execute()
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  await pg.schema.dropTable('FeatureFlagOwner').execute()
  await pg.schema.dropTable('FeatureFlag').execute()
}
