import {sql} from 'kysely'
import {RValue} from 'rethinkdb-ts'
import getRethink from '../../../database/rethinkDriver'
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
      sql`generate_series(
      date_trunc('month', ${queryStartDate.toISOString()}::date),
      date_trunc('month', ${queryEndDate.toISOString()}::date),
      ${sql`'1 month'::interval`}
    )`.as('monthStart')
    )
    .selectAll()

  const userSignups = pg
    .selectFrom('User')
    .select([
      sql<Date>`date_trunc('month', "createdAt")`.as('month'),
      sql<bigint>`COUNT(DISTINCT "id")`.as('signup_count')
    ])
    .where('createdAt', '>=', queryStartDate)
    .where('createdAt', '<', queryEndDate)
    .groupBy(sql`date_trunc('month', "createdAt")`)

  const query = pg
    .selectFrom(months.as('m'))
    .leftJoin(userSignups.as('us'), (join) =>
      join.onRef(sql`m."monthStart"`, '=', sql`us.month::timestamp`)
    )
    .select([
      sql<Date>`m."monthStart"`.as('monthStart'),
      sql<bigint>`COALESCE(us.signup_count, 0)`.as('signupCount')
    ])
    .orderBy('monthStart')

  const r = await getRethink()
  try {
    const [signupCounts, rawMeetingCounts] = await Promise.all([
      query.execute(),
      pg
        .selectFrom('NewMeeting')
        .select(({fn, ref, val}) => [
          fn<Date>('date_trunc', [val('month'), ref('createdAt')]).as('monthStart'),
          fn<string[]>('array_agg', ['id']).as('meetingIds')
        ])
        .where('createdAt', '>=', queryStartDate)
        .where('createdAt', '<', queryEndDate)
        .groupBy('monthStart')
        .execute()
    ])
    const meetingIds = rawMeetingCounts.flatMap((row) => row.meetingIds)
    const participantCounts = (await (
      r
        .table('MeetingMember')
        .getAll(r.args(meetingIds), {index: 'meetingId'})
        .group('meetingId') as any
    )
      .count()
      .ungroup()
      .map((group: RValue) => ({
        meetingId: group('group'),
        participantCount: group('reduction')
      }))
      .run()) as {meetingId: string; participantCount: number}[]

    // Combine PostgreSQL and RethinkDB results
    const combinedResults = signupCounts.map((pgRow) => {
      const epochMonthStart = pgRow.monthStart.getTime()
      const meetingCount = rawMeetingCounts.find(
        (rmc) => rmc.monthStart.getTime() === epochMonthStart
      )
      const participantCount = participantCounts.find((pc) =>
        meetingCount?.meetingIds.includes(pc.meetingId)
      )
      return {
        monthStart: pgRow.monthStart,
        signupCount: pgRow.signupCount ? Number(pgRow.signupCount) : 0,
        participantCount: participantCount?.participantCount ?? 0,
        meetingCount: meetingCount?.meetingIds.length ?? 0
      }
    })
    return {rows: combinedResults}
  } catch (error) {
    console.error('Error executing Org Activity Report:', error)
    return {error: {message: 'Error executing Org Activity Report'}}
  }
}

export default runOrgActivityReport
