import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('SAML').dropColumn('url').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('SAML').addColumn('url', 'varchar(2056)').execute()
}
