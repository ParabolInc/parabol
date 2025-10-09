import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('PageExternalAccess')
    .addColumn('invitedBy', 'varchar(100)', (col) => col.references('User.id').onDelete('cascade'))
    .execute()
  await db.updateTable('PageExternalAccess').set({invitedBy: 'aGhostUser'}).execute()
  await db.schema
    .alterTable('PageExternalAccess')
    .alterColumn('invitedBy', (ab) => ab.setNotNull())
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('PageExternalAccess').dropColumn('invitedBy').execute()
}
