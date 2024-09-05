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
    .addColumn('featureFlagId', 'uuid', (col) =>
      col.notNull().references('FeatureFlag.id').onDelete('cascade')
    )
    .addColumn('userId', 'varchar(255)')
    .addColumn('teamId', 'varchar(255)')
    .addColumn('orgId', 'varchar(255)')
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addCheckConstraint(
      'check_feature_flag_owner_exclusivity',
      sql`
      (("userId" IS NOT NULL AND "teamId" IS NULL AND "orgId" IS NULL) OR
       ("userId" IS NULL AND "teamId" IS NOT NULL AND "orgId" IS NULL) OR
       ("userId" IS NULL AND "teamId" IS NULL AND "orgId" IS NOT NULL))
    `
    )
    .execute()

  await pg.schema
    .createIndex('idx_feature_flag_owner_user')
    .on('FeatureFlagOwner')
    .columns(['userId', 'featureFlagId'])
    .execute()

  await pg.schema
    .createIndex('idx_feature_flag_owner_team')
    .on('FeatureFlagOwner')
    .columns(['teamId', 'featureFlagId'])
    .execute()

  await pg.schema
    .createIndex('idx_feature_flag_owner_org')
    .on('FeatureFlagOwner')
    .columns(['orgId', 'featureFlagId'])
    .execute()
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  await pg.schema.dropTable('FeatureFlag').execute()
  await pg.schema.dropTable('FeatureFlagOwner').execute()
}
