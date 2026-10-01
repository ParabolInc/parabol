import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('SAML').dropConstraint('SAML_orgId_key').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('SAML').addUniqueConstraint('SAML_orgId_key', ['orgId']).execute()
}
