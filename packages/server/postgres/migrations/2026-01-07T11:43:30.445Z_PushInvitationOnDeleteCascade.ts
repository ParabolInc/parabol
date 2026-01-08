import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('PushInvitation').dropConstraint('fk_userId').execute()

  await db.schema
    .alterTable('PushInvitation')
    .addForeignKeyConstraint('fk_userId', ['userId'], 'User', ['id'], (cb) =>
      cb.onDelete('cascade')
    )
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('PushInvitation').dropConstraint('fk_userId').execute()

  await db.schema
    .alterTable('PushInvitation')
    .addForeignKeyConstraint('fk_userId', ['userId'], 'User', ['id'], (cb) =>
      cb.onDelete('set null')
    )
    .execute()
}
