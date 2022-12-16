import ms from 'ms'
<<<<<<< HEAD
import {r} from 'rethinkdb-ts'
import {RDatum, RValue} from '../../database/stricterR'
import {DataLoaderWorker} from '../../graphql/graphql'

const STICKY_TEAM_MIN_MEETING_ATTENDEES = 2
const STICKY_TEAM_MIN_MEETINGS = 3
const PERSONAL_TIER_MAX_TEAMS = 2
const PERSONAL_TIER_LOCK_AFTER_DAYS = 30
=======
import {TeamsLimit} from 'parabol-client/types/constEnums'
import {r} from 'rethinkdb-ts'
import {RDatum, RValue} from '../../database/stricterR'
import NotificationTeamsLimitExceeded from '../../database/types/NotificationTeamsLimitExceeded'
import {DataLoaderWorker} from '../../graphql/graphql'
import isValid from '../../graphql/isValid'
import publishNotification from '../../graphql/public/mutations/helpers/publishNotification'
import getPg from '../../postgres/getPg'
import {appendUserFeatureFlagsQuery} from '../../postgres/queries/generated/appendUserFeatureFlagsQuery'

const getBillingLeaders = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const billingLeaderIds = (await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null, role: 'BILLING_LEADER'})
    .coerceTo('array')('userId')
    .run()) as unknown as string[]

  return (await dataLoader.get('users').loadMany(billingLeaderIds)).filter(isValid)
}

const enableUsageStats = async (userIds: string[], orgId: string) => {
  await r
    .table('OrganizationUser')
    .getAll(r.args(userIds), {index: 'userId'})
    .filter({orgId})
    .update({suggestedTier: 'pro'})
    .run()

  await appendUserFeatureFlagsQuery.run({ids: userIds, flag: 'insights'}, getPg())
}

const sendWebsiteNotifications = async (
  orgId: string,
  userIds: string[],
  dataLoader: DataLoaderWorker
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const notificationsToInsert = userIds.map((userId) => {
    return new NotificationTeamsLimitExceeded({
      userId,
      orgId
    })
  })

  await r.table('Notification').insert(notificationsToInsert).run()

  notificationsToInsert.forEach((notification) => {
    publishNotification(notification, subOptions)
  })
}
>>>>>>> feat/7567/usage-stats-warning

const isLimitExceeded = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamIds = teams.map(({id}) => id)

<<<<<<< HEAD
  if (teamIds.length <= PERSONAL_TIER_MAX_TEAMS) {
=======
  if (teamIds.length <= TeamsLimit.PERSONAL_TIER_MAX_TEAMS) {
>>>>>>> feat/7567/usage-stats-warning
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
<<<<<<< HEAD
        .filter((row) => row('meetingMembers').ge(STICKY_TEAM_MIN_MEETING_ATTENDEES))
        .group('teamId')
        .ungroup()
        .filter((row) => row('reduction').count().ge(STICKY_TEAM_MIN_MEETINGS))
        .count()
        .gt(PERSONAL_TIER_MAX_TEAMS)
=======
        .filter((row) => row('meetingMembers').ge(TeamsLimit.STICKY_TEAM_MIN_MEETING_ATTENDEES))
        .group('teamId')
        .ungroup()
        .filter((row) => row('reduction').count().ge(TeamsLimit.STICKY_TEAM_MIN_MEETINGS))
        .count()
        .gt(TeamsLimit.PERSONAL_TIER_MAX_TEAMS)
>>>>>>> feat/7567/usage-stats-warning
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

<<<<<<< HEAD
=======
  // Schedule lock
>>>>>>> feat/7567/usage-stats-warning
  await r
    .table('Organization')
    .get(orgId)
    .update({
      tierLimitExceededAt: now,
<<<<<<< HEAD
      scheduledLockAt: new Date(now.getTime() + ms(`${PERSONAL_TIER_LOCK_AFTER_DAYS}d`)),
      updatedAt: now
    })
    .run()
=======
      scheduledLockAt: new Date(now.getTime() + ms(`${TeamsLimit.PERSONAL_TIER_LOCK_AFTER_DAYS}d`)),
      updatedAt: now
    })
    .run()

  const billingLeaders = await getBillingLeaders(orgId, dataLoader)
  const billingLeadersIds = billingLeaders.map((billingLeader) => billingLeader.id)

  // Enable usage stats
  if (organization.activeDomain) {
    await enableUsageStats(billingLeadersIds, orgId)

    // Send push notification
    await sendWebsiteNotifications(orgId, billingLeadersIds, dataLoader)
  }
>>>>>>> feat/7567/usage-stats-warning
}
