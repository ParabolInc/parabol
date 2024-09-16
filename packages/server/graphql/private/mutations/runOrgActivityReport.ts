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

  const query = sql`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', ${queryStartDate}::date),
        date_trunc('month', ${queryEndDate}::date),
        '1 month'::interval
      ) AS monthStart
    ),
    user_signups AS (
      SELECT
        date_trunc('month', "createdAt") AS month,
        COUNT(DISTINCT "id") AS signup_count
      FROM "User"
      WHERE "createdAt" BETWEEN ${queryStartDate} AND ${queryEndDate}
      GROUP BY month
    ),
    user_logins AS (
      SELECT
        date_trunc('month', "lastSeenAt") AS month,
        COUNT(DISTINCT "id") AS login_count
      FROM "User"
      WHERE "lastSeenAt" BETWEEN ${queryStartDate} AND ${queryEndDate}
      GROUP BY month
    )
    SELECT
      m.monthStart as "monthStart",
      (m.monthStart + interval '1 month' - interval '1 day')::date AS "lastDayOfMonth",
      'All Organizations' AS "orgName",
      COALESCE(us.signup_count, 0) AS "signupCount",
      COALESCE(ul.login_count, 0) AS "loginCount"
    FROM months m
    LEFT JOIN user_signups us ON m.monthStart = us.month
    LEFT JOIN user_logins ul ON m.monthStart = ul.month
    ORDER BY m.monthStart
  `

  const r = await getRethink()
  try {
    const [pgResults, rethinkResults] = await Promise.all([
      query.execute(pg),
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
    const combinedResults = pgResults.rows.map((pgRow: any) => {
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
