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
  const queryStartDate = startDate || new Date(0)

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
    .groupBy(['month', 'Organization.name'])

  const userLogins = pg
    .selectFrom('User')
    .innerJoin('OrganizationUser', 'User.id', 'OrganizationUser.userId')
    .innerJoin('Organization', 'OrganizationUser.orgId', 'Organization.id')
    .select([
      sql`date_trunc('month', "User"."lastSeenAt")`.as('month'),
      'Organization.name as orgName',
      sql`COUNT(DISTINCT "User"."id")`.as('login_count')
    ])
    .where('User.lastSeenAt', '>=', queryStartDate)
    .where('User.lastSeenAt', '<', queryEndDate)
    .groupBy(['month', 'Organization.name'])

  const query = pg
    .selectFrom(months.as('m'))
    .leftJoin(userSignups.as('us'), (join) =>
      join.onRef(sql`m."monthStart"`, '=', sql`us.month::timestamp`)
    )
    .leftJoin(userLogins.as('ul'), (join) =>
      join
        .onRef(sql`m."monthStart"`, '=', sql`ul.month::timestamp`)
        .onRef('us.orgName', '=', 'ul.orgName')
    )
    .select([
      sql`m."monthStart"`.as('monthStart'),
      'us.orgName',
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

    const combinedResults = pgResults.map((pgRow: any) => {
      const monthStart = new Date(pgRow.monthStart)
      const rethinkParticipants = rethinkResults.find(
        (r: any) =>
          r.yearMonth.month === monthStart.getUTCMonth() + 1 &&
          r.yearMonth.year === monthStart.getUTCFullYear()
      )
      const rethinkMeetings = rethinkResults.find(
        (r: any) =>
          r.yearMonth.month === monthStart.getUTCMonth() + 1 &&
          r.yearMonth.year === monthStart.getUTCFullYear()
      )

      return {
        monthStart: pgRow.monthStart,
        signups: [
          {
            orgName: pgRow.orgName,
            signupCount: pgRow.signupCount
          }
        ],
        logins: [
          {
            orgName: pgRow.orgName,
            loginCount: pgRow.loginCount
          }
        ],
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
