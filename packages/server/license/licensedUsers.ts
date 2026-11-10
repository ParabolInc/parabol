import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'
import type {UsageReportOrganization} from './licenseToken'

/*
The users a license covers: the members of the organizations that depend on it, meaning those with a paid tier and
no Stripe subscription. A member counts the way billing counts them: not removed from the organization, and not
inactive. Someone in several such organizations counts once.
*/

const activeLicensedMembers = () =>
  getKysely()
    .selectFrom('OrganizationUser as ou')
    .innerJoin('User as u', 'u.id', 'ou.userId')
    .innerJoin('Organization as o', 'o.id', 'ou.orgId')
    .where('o.tier', '!=', 'starter')
    .where('o.stripeSubscriptionId', 'is', null)
    .where('ou.removedAt', 'is', null)
    .where('u.inactive', '=', false)

export const countActiveLicensedUsers = async () => {
  const row = await activeLicensedMembers()
    .select(({fn}) => fn.count<string>('ou.userId').distinct().as('count'))
    .executeTakeFirst()
  return Number(row?.count ?? 0)
}

export const countActiveLicensedUsersByOrg = async (): Promise<UsageReportOrganization[]> => {
  const rows = await activeLicensedMembers()
    .select(({fn}) => ['o.id', 'o.name', fn.count<string>('ou.userId').distinct().as('count')])
    .groupBy(['o.id', 'o.name'])
    .orderBy('o.name')
    .execute()
  return rows.map(({id, name, count}) => ({id, name, activeUsers: Number(count)}))
}

/**
 * For each month from `since` to now, as YYYY-MM in UTC, the most users active at the end of any day of it, from
 * the organizations' membership history. It's the history billing keeps, so it covers the organizations that
 * depend on the license now, as far back as they kept it.
 */
export const readMonthlyPeaks = async (since: Date): Promise<Record<string, number>> => {
  const {rows} = await sql<{month: string; peak: number}>`
    with spans as (
      select a."userId", a."eventType", a."eventDate",
        lead(a."eventDate") over (partition by a."orgId", a."userId" order by a."eventDate", a.id) as "nextEventDate"
      from "OrganizationUserAudit" a
      join "Organization" o on o.id = a."orgId"
      where o.tier != 'starter' and o."stripeSubscriptionId" is null
    ),
    days as (
      select d as day, least((d + interval '1 day') at time zone 'UTC', now()) as at
      from generate_series(
        date_trunc('day', ${since}::timestamptz at time zone 'UTC'),
        now() at time zone 'UTC',
        interval '1 day'
      ) as d
    ),
    daily as (
      select days.day, count(distinct s."userId") as active
      from days
      left join spans s
        on s."eventType" in ('added', 'activated')
        and s."eventDate" < days.at
        and (s."nextEventDate" is null or s."nextEventDate" >= days.at)
      group by days.day
    )
    select to_char(day, 'YYYY-MM') as month, max(active)::int as peak
    from daily
    group by 1
    order by 1
  `.execute(getKysely())
  return Object.fromEntries(rows.map(({month, peak}) => [month, peak]))
}
