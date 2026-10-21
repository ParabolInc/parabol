import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // The levels an org groups its teams by, widest first, like business unit, then department
  await db.schema
    .createTable('TeamStructureLevel')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('orgId', 'varchar(100)', (col) =>
      col.notNull().references('Organization.id').onDelete('cascade')
    )
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('sortOrder', 'integer', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()
  await db.schema
    .createIndex('idx_TeamStructureLevel_orgId')
    .ifNotExists()
    .on('TeamStructureLevel')
    .column('orgId')
    .execute()
  await db.schema
    .createTable('TeamStructureValue')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('levelId', 'integer', (col) =>
      col.notNull().references('TeamStructureLevel.id').onDelete('cascade')
    )
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('sortOrder', 'integer', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()
  await db.schema
    .createIndex('idx_TeamStructureValue_levelId')
    .ifNotExists()
    .on('TeamStructureValue')
    .column('levelId')
    .execute()
  // a team sits at one value of each level, or at none until someone places it
  await db.schema
    .createTable('TeamStructurePlacement')
    .ifNotExists()
    .addColumn('teamId', 'varchar(100)', (col) =>
      col.notNull().references('Team.id').onDelete('cascade')
    )
    .addColumn('levelId', 'integer', (col) =>
      col.notNull().references('TeamStructureLevel.id').onDelete('cascade')
    )
    .addColumn('valueId', 'integer', (col) =>
      col.notNull().references('TeamStructureValue.id').onDelete('cascade')
    )
    .addPrimaryKeyConstraint('TeamStructurePlacement_pkey', ['teamId', 'levelId'])
    .execute()
  await db.schema
    .createIndex('idx_TeamStructurePlacement_valueId')
    .ifNotExists()
    .on('TeamStructurePlacement')
    .column('valueId')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('TeamStructurePlacement').ifExists().execute()
  await db.schema.dropTable('TeamStructureValue').ifExists().execute()
  await db.schema.dropTable('TeamStructureLevel').ifExists().execute()
}
