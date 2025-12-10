import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('User').addColumn('persistentUserId', 'varchar(255)').execute()
  await db.schema
    .createIndex('idx_User_persistentUserId')
    .on('User')
    .column('persistentUserId')
    .where('persistentUserId', 'is not', null)
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('User').dropColumn('persistentUserId').execute()
}
