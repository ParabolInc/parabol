import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'
import type {UsageReportOrganization} from './licenseToken'

/*
The users a license covers: a license is for the whole instance, so it's the members of every organization on it. A
member counts the way billing counts them: not removed from the organization, and not inactive. Someone in several
organizations counts once. Parabol's own system organization and users, which every instance has, don't count.
*/

const SYSTEM_ORG_ID = 'aGhostOrg'
const SYSTEM_USER_IDS = ['aGhostUser', 'parabolAIUser']

const activeMembers = () =>
  getKysely()
    .selectFrom('OrganizationUser as ou')
    .innerJoin('User as u', 'u.id', 'ou.userId')
    .innerJoin('Organization as o', 'o.id', 'ou.orgId')
    .where('ou.removedAt', 'is', null)
    .where('u.inactive', '=', false)
    .where('ou.orgId', '!=', SYSTEM_ORG_ID)
    .where('ou.userId', 'not in', SYSTEM_USER_IDS)

export const countActiveUsers = async () => {
  const row = await activeMembers()
    .select(({fn}) => fn.count<string>('ou.userId').distinct().as('count'))
    .executeTakeFirst()
  return Number(row?.count ?? 0)
}

export const countActiveUsersByOrg = async (): Promise<UsageReportOrganization[]> => {
  const rows = await activeMembers()
    .select(({fn}) => ['o.id', 'o.name', fn.count<string>('ou.userId').distinct().as('count')])
    .groupBy(['o.id', 'o.name'])
    .orderBy('o.name')
    .execute()
  return rows.map(({id, name, count}) => ({id, name, activeUsers: Number(count)}))
}

/**
 * For each month from `since` to now, as YYYY-MM in UTC, the most users active at the end of any day of it, from
 * the organizations' membership history. It's the history billing keeps, as far back as it goes.
 */
export const readMonthlyPeaks = async (since: Date): Promise<Record<string, number>> => {
  const {rows} = await sql<{month: string; peak: number}>`
    with spans as (
      select a."userId", a."eventType", a."eventDate",
        lead(a."eventDate") over (partition by a."orgId", a."userId" order by a."eventDate", a.id) as "nextEventDate"
      from "OrganizationUserAudit" a
      where a."orgId" != ${SYSTEM_ORG_ID} and a."userId" != all(${SYSTEM_USER_IDS})
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
