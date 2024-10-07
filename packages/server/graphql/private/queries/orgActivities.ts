import {sql} from 'kysely'
import getRethink from '../../../database/rethinkDriver'
import {RDatum, RValue} from '../../../database/stricterR'
import getKysely from '../../../postgres/getKysely'
import {OrgActivityRow, QueryResolvers} from '../resolverTypes'

const orgActivities: QueryResolvers['orgActivities'] = async (_source, {startDate, endDate}) => {
  const pg = getKysely()
  const now = new Date()
  const queryEndDate = endDate || now
  const queryStartDate = startDate || new Date(0) // Unix epoch start if not provided

  const months = pg
    .selectFrom(
      sql`generate_series(
      date_trunc('month', ${queryStartDate.toISOString()}::date),
      date_trunc('month', ${queryEndDate.toISOString()}::date),
      ${sql`'1 month'::interval`}
    )`.as('monthStart')
    )
    .selectAll()

  const userSignups = pg
    .selectFrom('User')
    .innerJoin('OrganizationUser', 'User.id', 'OrganizationUser.userId')
    .innerJoin('Organization', 'OrganizationUser.orgId', 'Organization.id')
    .select([
      sql`date_trunc('month', "User"."createdAt")`.as('month'),
      'Organization.name as orgName',
      sql`COUNT(DISTINCT "User"."id")`.as('signup_count')
    ])
    .where('User.createdAt', '>=', queryStartDate)
    .where('User.createdAt', '<', queryEndDate)
    .groupBy(sql`date_trunc('month', "User"."createdAt")`)
    .groupBy('Organization.name')

  const query = pg
    .selectFrom(months.as('m'))
    .leftJoin(userSignups.as('us'), (join) =>
      join.onRef(sql`m."monthStart"`, '=', sql`us.month::timestamp`)
    )
    .select([
      sql`m."monthStart"`.as('monthStart'),
      sql`COALESCE(us."orgName", 'All Organizations')`.as('orgName'),
      sql`COALESCE(us.signup_count, 0)`.as('signupCount')
    ])
    .orderBy('monthStart')

  const r = await getRethink()
  try {
    const [pgResults, rethinkResults] = await Promise.all([
      query.execute(),
      r
        .table('NewMeeting')
        .between(
          r.epochTime(queryStartDate.getTime() / 1000),
          r.epochTime(queryEndDate.getTime() / 1000),
          {index: 'createdAt'}
        )
        .merge((row: RValue) => ({
          yearMonth: {
            year: row('createdAt').year(),
            month: row('createdAt').month()
          }
        }))
        .group((row) => row('yearMonth'))
        .ungroup()
        .map((group: RDatum) => ({
          yearMonth: group('group'),
          meetingCount: group('reduction').count(),
          participantIds: group('reduction')
            .concatMap((row: RDatum) =>
              r.table('MeetingMember').getAll(row('id'), {index: 'meetingId'})('userId')
            )
            .distinct()
        }))
        .map((row: RDatum) =>
          row.merge({
            participantCount: row('participantIds').count()
          })
        )
        .without('participantIds')
        .run()
    ])

    // Combine PostgreSQL and RethinkDB results
    const combinedResults: OrgActivityRow[] = pgResults.reduce((acc: any, pgRow: any) => {
      const monthStart = new Date(pgRow.monthStart)
      const monthKey = monthStart.toISOString()

      if (!acc[monthKey]) {
        acc[monthKey] = {
          monthStart: pgRow.monthStart,
          signups: [],
          participantCount: 0,
          meetingCount: 0
        }
      }

      acc[monthKey].signups.push({
        orgName: pgRow.orgName,
        count: pgRow.signupCount
      })

      const rethinkData = rethinkResults.find(
        (r: any) =>
          r.yearMonth.month === monthStart.getUTCMonth() + 1 &&
          r.yearMonth.year === monthStart.getUTCFullYear()
      )

      if (rethinkData) {
        acc[monthKey].participantCount = rethinkData.participantCount
        acc[monthKey].meetingCount = rethinkData.meetingCount
      }

      return acc
    }, {})

    const rows = Object.values(combinedResults)
    return {rows}
  } catch (error) {
    console.error('Error executing Org Activity Report:', error)
    return {error: {message: 'Error executing Org Activity Report'}}
  }
}

export default orgActivities
