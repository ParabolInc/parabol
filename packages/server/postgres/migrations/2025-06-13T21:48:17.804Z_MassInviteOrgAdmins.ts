import {sql, type Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // delete old records to make the rest go faster
  await db
    .deleteFrom('MassInvitation')
    .where('expiration', '<=', sql`CURRENT_TIMESTAMP`)
    .execute()

  // add nullable columns
  await db.schema
    .alterTable('MassInvitation')
    .addColumn('userId', 'varchar(100)', (col) => col.references('User.id').onDelete('cascade'))
    .addColumn('teamId', 'varchar(100)', (col) => col.references('Team.id').onDelete('cascade'))
    .execute()

  // TODO this must be in a separate migration

  // fill nullable columns
  await db
    .updateTable('MassInvitation')
    .set({
      userId: sql`split_part("teamMemberId", '::', 1)`,
      teamId: sql`split_part("teamMemberId", '::', 2)`
    })
    .execute()

  await Promise.all([
    db.schema
      .createIndex('idx_MassInvitation_userId')
      .on('MassInvitation')
      .column('userId')
      .execute(),
    db.schema
      .createIndex('idx_MassInvitation_teamId')
      .on('MassInvitation')
      .column('teamId')
      .execute()
  ])

  // move to new columns
  await db.schema
    .alterTable('MassInvitation')
    .alterColumn('userId', (ab) => ab.setNotNull())
    .alterColumn('teamId', (ab) => ab.setNotNull())
    .dropColumn('teamMemberId')
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('MassInvitation')
    .addColumn('teamMemberId', 'varchar(100)')
    .dropColumn('userId')
    .dropColumn('teamId')
    .execute()
}
