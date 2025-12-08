import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('User').addColumn('SAMLUserId', 'varchar(255)').execute()
  await db.schema
    .createIndex('idx_User_SAMLUserId')
    .on('User')
    .column('SAMLUserId')
    .where('SAMLUserId', 'is not', null)
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('User').dropColumn('SAMLUserId').execute()
}
