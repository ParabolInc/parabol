import {type Kysely, sql} from 'kysely'

// One row, id 'instance': when the instance was first found to need a license it didn't have, which starts the
// grace period before paid features without a Stripe subscription end, and when more users first became active than
// its license covers, which starts the license's onOverSeats timeline
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('InstanceLicense')
    .addColumn('id', 'varchar(20)', (col) => col.primaryKey())
    .addColumn('unlicensedSince', 'timestamptz')
    .addColumn('overSeatsSince', 'timestamptz')
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('InstanceLicense').execute()
}
