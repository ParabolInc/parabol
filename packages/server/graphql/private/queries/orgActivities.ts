import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {Logger} from '../../../utils/Logger'
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
      sql<Date>`date_trunc('month', "User"."createdAt")`.as('month'),
      'Organization.name as orgName',
      sql<bigint>`COUNT(DISTINCT "User"."id")`.as('signup_count')
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
      sql<Date>`m."monthStart"`.as('monthStart'),
      sql<string>`COALESCE(us."orgName", 'All Organizations')`.as('orgName'),
      sql<bigint>`COALESCE(us.signup_count, 0)`.as('signupCount')
    ])
    .orderBy('monthStart')

  try {
    const [signupsResult, rawMeetingResult] = await Promise.all([
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
    const meetingIds = rawMeetingResult.flatMap((row) => row.meetingIds)
    const participantCounts = await pg
      .selectFrom('MeetingMember')
      .select(({fn}) => ['meetingId', fn.count('id').as('participantCount')])
      .where('meetingId', 'in', meetingIds)
      .groupBy('meetingId')
      .execute()
    // Combine results
    const combinedResults = signupsResult.reduce(
      (acc, signupRow) => {
        const epochMonthStart = signupRow.monthStart.getTime()
        const monthKey = signupRow.monthStart.toISOString()

        if (!acc[monthKey]) {
          acc[monthKey] = {
            monthStart: signupRow.monthStart,
            signups: [],
            participantCount: 0,
            meetingCount: 0
          }
        }

        acc[monthKey].signups.push({
          orgName: signupRow.orgName,
          count: Number(signupRow.signupCount)
        })

        const meetingData = rawMeetingResult.find((r) => r.monthStart.getTime() === epochMonthStart)
        const participantCount = participantCounts
          .filter((pc) => meetingData?.meetingIds.includes(pc.meetingId))
          .map((pc) => Number(pc.participantCount))
          .reduce((a, b) => a + b, 0)
        acc[monthKey].participantCount = participantCount
        acc[monthKey].meetingCount = meetingData?.meetingIds.length ?? 0
        return acc
      },
      {} as Record<string, OrgActivityRow>
    )

    const rows = Object.values(combinedResults)
    return {rows}
  } catch (error) {
    Logger.error('Error executing Org Activity Report:', error)
    return {error: {message: 'Error executing Org Activity Report'}}
  }
}

export default orgActivities
