import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('CompanyCluster')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)')
    .execute()

  await db.schema
    .createTable('CompanyClusterDomain')
    .addColumn('companyClusterId', 'integer', (col) =>
      col.notNull().references('CompanyCluster.id').onDelete('cascade')
    )
    .addColumn('domain', 'varchar(255)', (col) => col.notNull())
    .addColumn('updatedAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('isManuallyCreated', 'boolean', (col) => col.notNull().defaultTo(false))
    .addPrimaryKeyConstraint('CompanyClusterDomain_pkey', ['companyClusterId', 'domain'])
    .execute()

  await db.schema
    .createTable('CompanyClusterOrganization')
    .addColumn('companyClusterId', 'integer', (col) =>
      col.notNull().references('CompanyCluster.id').onDelete('cascade')
    )
    .addColumn('orgId', 'varchar(100)')
    .addColumn('isPrimary', 'boolean', (col) => col.notNull().defaultTo(false))
    // .addColumn('orgId', 'varchar(100)', (col) =>
    //   col.notNull().references('Organization.id').onDelete('cascade')
    // )
    .addPrimaryKeyConstraint('CompanyClusterOrganization_pkey', ['companyClusterId', 'orgId'])
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('CompanyClusterOrganization').execute()
  await db.schema.dropTable('CompanyClusterDomain').execute()
  await db.schema.dropTable('CompanyCluster').execute()
}
