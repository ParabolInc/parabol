import { sql, type Kysely } from 'kysely'

// biome-ignore lint/suspicious/noExplicitAny: `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('Organization')
    .addColumn('isPaid', 'boolean', (col) => col.defaultTo(true).notNull())
    .execute()
  await db.updateTable('Organization')
    .set((eb) => ({
      isPaid: eb.selectFrom('Team').select(({fn}) => fn('bool_and', ['isPaid']).as('isPaid')).whereRef('Organization.id', '=', 'orgId')
    }))
    .execute()

  await db.schema.alterTable('User')
    .dropColumn('tier')
    .dropColumn('trialStartDate')
    .execute()
  await db.schema.alterTable('OrganizationUser')
    .dropColumn('tier')
    .dropColumn('trialStartDate')
    .dropColumn('inactive')
    .execute()
  await db.schema.alterTable('Team')
    .dropColumn('tier')
    .dropColumn('trialStartDate')
    .dropColumn('isPaid')
    .execute()
  await db.schema.alterTable('TeamMember')
    .dropColumn('picture')
    .dropColumn('preferredName')
    .dropColumn('email')
    .execute()
}

// biome-ignore lint/suspicious/noExplicitAny: `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('OrganizationUser')
    .addColumn('tier', sql`"TierEnum"`) // no default, not null
    .addColumn('trialStartDate', sql`timestamp with time zone`)
    .addColumn('inactive', 'boolean', (col) => col.defaultTo(false).notNull())
    .execute()
  await db.updateTable('OrganizationUser')
    .set((eb) => ({
      tier: eb.selectFrom('Organization').select('tier').whereRef('Organization.id', '=', 'orgId'),
      trialStartDate: eb.selectFrom('Organization').select('trialStartDate').whereRef('Organization.id', '=', 'orgId'),
      inactive: eb.selectFrom('User').select('inactive').whereRef('User.id', '=', 'userId'),
    }))
    .execute()
  await db.schema.alterTable('OrganizationUser')
    .alterColumn('tier', (ac) => ac.setNotNull())
    .execute()

  await db.schema.alterTable('User')
    .addColumn('tier', sql`"TierEnum"`, (col) => col.defaultTo('starter').notNull())
    .addColumn('trialStartDate', sql`timestamp with time zone`)
    .execute()
  await db.updateTable('User')
    .set((eb) => ({
      tier: eb.fn.coalesce(eb.selectFrom('OrganizationUser').select((se) => se.fn.max('tier').as('tier')).whereRef('OrganizationUser.userId', '=', 'id'), eb.val('starter')),
      trialStartDate: eb.selectFrom('OrganizationUser').select((se) => se.fn.min('trialStartDate').as('trialStartDate')).whereRef('OrganizationUser.userId', '=', 'id'),
    }))
    .execute()

  await db.schema.alterTable('TeamMember')
    .addColumn('picture', 'varchar(2056)') // no default, not null
    .addColumn('preferredName', 'varchar(100)') // no default, not null
    .addColumn('email', sql`citext`) // no default, not null
    .execute()
  await db.updateTable('TeamMember')
    .set((eb) => ({
      picture: eb.selectFrom('User').select('picture').whereRef('User.id', '=', 'userId'),
      preferredName: eb.selectFrom('User').select('preferredName').whereRef('User.id', '=', 'userId'),
      email: eb.selectFrom('User').select('email').whereRef('User.id', '=', 'userId')
    }))
    .execute()
  await db.schema.alterTable('TeamMember')
    .alterColumn('picture', (ac) => ac.setNotNull())
    .alterColumn('preferredName', (ac) => ac.setNotNull())
    .alterColumn('email', (ac) => ac.setNotNull())
    .execute()

  await db.schema.alterTable('Team')
    .addColumn('tier', sql`"TierEnum"`) // no default, not null
    .addColumn('trialStartDate', sql`timestamp with time zone`)
    .addColumn('isPaid', 'boolean', (col) => col.defaultTo(true).notNull())
    .execute()
  await db.updateTable('Team')
    .set((eb) => ({
      tier: eb.selectFrom('Organization').select('tier').whereRef('Organization.id', '=', 'orgId'),
      trialStartDate: eb.selectFrom('Organization').select('trialStartDate').whereRef('Organization.id', '=', 'orgId'),
      isPaid: eb.selectFrom('Organization').select('isPaid').whereRef('Organization.id', '=', 'orgId')
    }))
    .execute()
  await db.schema.alterTable('Team')
    .alterColumn('tier', (ac) => ac.setNotNull())
    .execute()

  await db.schema.alterTable('Organization')
    .dropColumn('isPaid')
    .execute()

}
