import ms from 'ms'
import {r} from 'rethinkdb-ts'
import {RDatum, RValue} from '../../database/stricterR'
import {DataLoaderWorker} from '../../graphql/graphql'

const STICKY_TEAM_MIN_MEETING_ATTENDEES = 2
const STICKY_TEAM_MIN_MEETINGS = 3
const PERSONAL_TIER_MAX_TEAMS = 2
const PERSONAL_TIER_LOCK_AFTER_DAYS = 30

const isLimitExceeded = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamIds = teams.map(({id}) => id)

  if (teamIds.length <= PERSONAL_TIER_MAX_TEAMS) {
    return false
  }

  // Sticky team is the team that completed 3 meetings with more than 1 attendee
  // and have had at least 1 meeting in the last 30 days
  // Warning: the query is very expensive
  return r
    .table('NewMeeting')
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter((row: RDatum) => row('endedAt').default(null).ne(null))('id')
    .coerceTo('array')
    .distinct()
    .do((endedMeetingIds: RValue) => {
      return r
        .db('actionDevelopment')
        .table('MeetingMember')
        .getAll(r.args(endedMeetingIds), {index: 'meetingId'})
        .group('teamId', 'meetingId')
        .count()
        .ungroup()
        .map((row) => ({
          teamId: row('group')(0),
          meetingId: row('group')(1),
          meetingMembers: row('reduction')
        }))
        .filter((row) => row('meetingMembers').ge(STICKY_TEAM_MIN_MEETING_ATTENDEES))
        .group('teamId')
        .ungroup()
        .filter((row) => row('reduction').count().ge(STICKY_TEAM_MIN_MEETINGS))
        .count()
        .gt(PERSONAL_TIER_MAX_TEAMS)
    })
    .run()
}

// Warning: the function might be expensive
export const maybeRemoveRestrictions = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const organization = await dataLoader.get('organizations').load(orgId)

  if (!organization.tierLimitExceededAt) {
    return
  }

  if (!(await isLimitExceeded(orgId, dataLoader))) {
    await r
      .table('Organization')
      .get(orgId)
      .update({
        tierLimitExceededAt: null,
        scheduledLockAt: null,
        lockedAt: null,
        updatedAt: new Date()
      })
      .run()
  }
}

// Warning: the function might be expensive
export const checkTeamsLimit = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const organization = await dataLoader.get('organizations').load(orgId)

  if (!organization.featureFlags?.includes('teamsLimit')) {
    return
  }

  if (organization.tierLimitExceededAt || organization.tier !== 'personal') {
    return
  }

  if (!(await isLimitExceeded(orgId, dataLoader))) {
    return
  }

  const now = new Date()

  await r
    .table('Organization')
    .get(orgId)
    .update({
      tierLimitExceededAt: now,
      scheduledLockAt: new Date(now.getTime() + ms(`${PERSONAL_TIER_LOCK_AFTER_DAYS}d`)),
      updatedAt: now
    })
    .run()
}
