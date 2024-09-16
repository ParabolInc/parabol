import {sql} from 'kysely'
import getRethink from '../../../database/rethinkDriver'
import {RDatum, RValue} from '../../../database/stricterR'
import getKysely from '../../../postgres/getKysely'
import {MutationResolvers} from '../resolverTypes'

const runOrgActivityReport: MutationResolvers['runOrgActivityReport'] = async (
  _source,
  {startDate, endDate}
) => {
  const pg = getKysely()
  const now = new Date()
  const queryEndDate = endDate || now
  const queryStartDate = startDate || new Date(0) // Unix epoch start if not provided

  const months = pg
    .selectFrom(
      pg
        .selectFrom(
          sql<Date>`generate_series(date_trunc('month', ${queryStartDate}::date), date_trunc('month', ${queryEndDate}::date), '1 month'::interval)`.as(
            'series'
          )
        )
        .select(sql`series`.as('monthStart'))
        .as('months')
    )
    .select(sql`months."monthStart"`.as('monthStart'))

  console.log(months.compile())

  const userSignups = pg
    .selectFrom('User')
    .select([
      sql`date_trunc('month', "createdAt")`.as('month'),
      sql`COUNT(DISTINCT "id")`.as('signup_count')
    ])
    .where('createdAt', '>=', queryStartDate)
    .where('createdAt', '<=', queryEndDate)
    .groupBy(sql`date_trunc('month', "createdAt")`)

  const userLogins = pg
    .selectFrom('User')
    .select([
      sql`date_trunc('month', "lastSeenAt")`.as('month'),
      sql`COUNT(DISTINCT "id")`.as('login_count')
    ])
    .where('lastSeenAt', '>=', queryStartDate)
    .where('lastSeenAt', '<=', queryEndDate)
    .groupBy(sql`date_trunc('month', "lastSeenAt")`)

  const query = pg
    .selectFrom(months.as('m'))
    .leftJoin(userSignups.as('us'), (join) =>
      join.onRef('m.monthStart', '=', sql`us.month::timestamp`)
    )
    .leftJoin(userLogins.as('ul'), (join) =>
      join.onRef('m.monthStart', '=', sql`ul.month::timestamp`)
    )
    .select([
      sql`m."monthStart"`.as('monthStart'),
      sql`(m."monthStart" + interval '1 month' - interval '1 day')::date`.as('lastDayOfMonth'),
      sql`'All Organizations'`.as('orgName'),
      sql`COALESCE(us.signup_count, 0)`.as('signupCount'),
      sql`COALESCE(ul.login_count, 0)`.as('loginCount')
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
    const combinedResults = pgResults.map((pgRow: any) => {
      const monthStart = new Date(pgRow.monthStart)
      const rethinkParticipants = rethinkResults.find(
        (r: any) =>
          r.yearMonth.month === monthStart.getMonth() &&
          r.yearMonth.year === monthStart.getFullYear()
      )
      const rethinkMeetings = rethinkResults.find(
        (r: any) =>
          r.yearMonth.month === monthStart.getMonth() &&
          r.yearMonth.year === monthStart.getFullYear()
      )

      return {
        ...pgRow,
        participantCount: rethinkParticipants ? rethinkParticipants.participantCount : 0,
        meetingCount: rethinkMeetings ? rethinkMeetings.meetingCount : 0
      }
    })
    return {rows: combinedResults}
  } catch (error) {
    console.error('Error executing Org Activity Report:', error)
    return {error: {message: 'Error executing Org Activity Report'}}
  }
}

export default runOrgActivityReport
