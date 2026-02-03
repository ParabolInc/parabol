import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('User').renameColumn('persistentUserId', 'persistentNameId').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('User').renameColumn('persistentNameId', 'persistentUserId').execute()
}
