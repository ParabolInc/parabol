import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Organization')
    .addColumn('isPaid', 'boolean', (col) => col.defaultTo(true).notNull())
    .addColumn('unpaidMessageHTML', 'text')
    .execute()
  await db
    .updateTable('Organization')
    .set((eb) => ({
      isPaid: eb.fn.coalesce(
        eb
          .selectFrom('Team')
          .select(({fn}) => fn('bool_and', ['isPaid']).as('isPaid'))
          .whereRef('Organization.id', '=', 'orgId'),
        eb.val(true)
      ),
      unpaidMessageHTML: eb
        .selectFrom('Team')
        .select('lockMessageHTML')
        .whereRef('Organization.id', '=', 'orgId')
        .where('lockMessageHTML', 'is not', null)
        .where('isPaid', '=', false)
        .orderBy('updatedAt', 'desc')
        .limit(1)
    }))
    .execute()

  await db.schema.alterTable('User').dropColumn('tier').dropColumn('trialStartDate').execute()
  await db.schema
    .alterTable('OrganizationUser')
    .dropColumn('tier')
    .dropColumn('trialStartDate')
    .execute()
  await db.schema
    .alterTable('Team')
    .dropColumn('tier')
    .dropColumn('trialStartDate')
    .dropColumn('isPaid')
    .dropColumn('lockMessageHTML')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('OrganizationUser')
    .addColumn('tier', sql`"TierEnum"`) // no default, not null
    .addColumn('trialStartDate', sql`timestamp with time zone`)
    .execute()
  await db
    .updateTable('OrganizationUser')
    .set((eb) => ({
      tier: eb.selectFrom('Organization').select('tier').whereRef('Organization.id', '=', 'orgId'),
      trialStartDate: eb
        .selectFrom('Organization')
        .select('trialStartDate')
        .whereRef('Organization.id', '=', 'orgId')
    }))
    .execute()
  await db.schema
    .alterTable('OrganizationUser')
    .alterColumn('tier', (ac) => ac.setNotNull())
    .execute()

  await db.schema
    .alterTable('User')
    .addColumn('tier', sql`"TierEnum"`, (col) => col.defaultTo('starter').notNull())
    .addColumn('trialStartDate', sql`timestamp with time zone`)
    .execute()
  await db
    .updateTable('User')
    .set((eb) => ({
      tier: eb.fn.coalesce(
        eb
          .selectFrom('OrganizationUser')
          .select((se) => se.fn.max('tier').as('tier'))
          .whereRef('OrganizationUser.userId', '=', 'id'),
        eb.val('starter')
      ),
      trialStartDate: eb
        .selectFrom('OrganizationUser')
        .select((se) => se.fn.min('trialStartDate').as('trialStartDate'))
        .whereRef('OrganizationUser.userId', '=', 'id')
    }))
    .execute()

  await db.schema
    .alterTable('Team')
    .addColumn('tier', sql`"TierEnum"`) // no default, not null
    .addColumn('trialStartDate', sql`timestamp with time zone`)
    .addColumn('isPaid', 'boolean', (col) => col.defaultTo(true).notNull())
    .addColumn('lockMessageHTML', 'text')
    .execute()
  await db
    .updateTable('Team')
    .set((eb) => ({
      tier: eb.selectFrom('Organization').select('tier').whereRef('Organization.id', '=', 'orgId'),
      trialStartDate: eb
        .selectFrom('Organization')
        .select('trialStartDate')
        .whereRef('Organization.id', '=', 'orgId'),
      isPaid: eb
        .selectFrom('Organization')
        .select('isPaid')
        .whereRef('Organization.id', '=', 'orgId'),
      lockMessageHTML: eb
        .selectFrom('Organization')
        .select('unpaidMessageHTML')
        .whereRef('Organization.id', '=', 'orgId')
    }))
    .execute()
  await db.schema
    .alterTable('Team')
    .alterColumn('tier', (ac) => ac.setNotNull())
    .execute()

  await db.schema
    .alterTable('Organization')
    .dropColumn('isPaid')
    .dropColumn('unpaidMessageHTML')
    .execute()
}
