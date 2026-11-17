import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // A MeetingSeries stays the recurring meeting for exactly one team. A recurring meeting that
  // covers several teams is N of these rows sharing a groupId: a bare correlation key, not a
  // foreign key, since a group is defined entirely by its members & owns no facts of its own.
  // uuid rather than a sequence: randomUUIDv7() mints it in process, so the sibling rows can all
  // be inserted with it in hand, where a sequence would need its own db object & a round trip.
  // v7 is time-ordered, so new groups append to the index instead of scattering across it
  await db.schema
    .alterTable('MeetingSeries')
    .addColumn('groupId', 'uuid')
    // when set, only this user may administer the series, whatever team they are on. Null keeps
    // the original rule, where anyone on the team may administer it
    .addColumn('ownerUserId', 'varchar(100)', (col) =>
      col.references('User.id').onDelete('set null')
    )
    .execute()

  await db.schema
    .createIndex('idx_MeetingSeries_groupId')
    .ifNotExists()
    .on('MeetingSeries')
    .column('groupId')
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('idx_MeetingSeries_groupId').ifExists().execute()
  await db.schema
    .alterTable('MeetingSeries')
    .dropColumn('groupId')
    .dropColumn('ownerUserId')
    .execute()
}
