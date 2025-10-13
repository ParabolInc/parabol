import {type Kysely, sql} from 'kysely'
// prime with temporary list from https://github.com/disposable/disposable
// with addition of our own observed spam domains
import temporaryEmailDomains from './2025-10-13T11:57:39.091Z_temporaryEmailDomains.json'

const PG_MAX_PARAMS = 65535

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  db.schema
    .createTable('BlockedDomain')
    .addColumn('domain', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('createdAt', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  do {
    const batch = temporaryEmailDomains.splice(0, PG_MAX_PARAMS)
    await db
      .insertInto('BlockedDomain')
      .values(batch.map((domain) => ({domain})))
      .execute()
  } while (temporaryEmailDomains.length > 0)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  db.schema.dropTable('BlockedDomain').execute()
}
