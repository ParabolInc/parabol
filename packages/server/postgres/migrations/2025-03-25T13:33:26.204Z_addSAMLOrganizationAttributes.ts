import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  db.schema.alterTable('Organization').addColumn('samlId', 'varchar(100)').execute()
  db.schema.alterTable('SAML').addColumn('samlOrgAttribute', 'varchar(100)').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  db.schema.alterTable('Organization').dropColumn('samlId').execute()
  db.schema.alterTable('SAML').dropColumn('samlOrgAttribute').execute()
}
