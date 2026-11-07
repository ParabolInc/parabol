import {type Kysely, sql} from 'kysely'

// One row, id 'instance': when the instance was first found to need a license it didn't have, which starts the
// grace period before paid features without a Stripe subscription end
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('InstanceLicense')
    .addColumn('id', 'varchar(20)', (col) => col.primaryKey())
    .addColumn('unlicensedSince', 'timestamptz')
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('InstanceLicense').execute()
}
