import {sql, type Kysely} from 'kysely'

// biome-ignore lint/suspicious/noExplicitAny: `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('TeamMember')
    .dropColumn('picture')
    .dropColumn('preferredName')
    .dropColumn('email')
    .execute()
}

// biome-ignore lint/suspicious/noExplicitAny: `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('TeamMember')
    .addColumn('picture', 'varchar(2056)') // no default, not null
    .addColumn('preferredName', 'varchar(100)') // no default, not null
    .addColumn('email', sql`citext`) // no default, not null
    .execute()
  await db
    .updateTable('TeamMember')
    .set((eb) => ({
      picture: eb.selectFrom('User').select('picture').whereRef('User.id', '=', 'userId'),
      preferredName: eb
        .selectFrom('User')
        .select('preferredName')
        .whereRef('User.id', '=', 'userId'),
      email: eb.selectFrom('User').select('email').whereRef('User.id', '=', 'userId')
    }))
    .execute()
  await db.schema
    .alterTable('TeamMember')
    .alterColumn('picture', (ac) => ac.setNotNull())
    .alterColumn('preferredName', (ac) => ac.setNotNull())
    .alterColumn('email', (ac) => ac.setNotNull())
    .execute()
}
