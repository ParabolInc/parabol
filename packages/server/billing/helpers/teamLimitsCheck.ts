import ms from 'ms'
import {Threshold} from 'parabol-client/types/constEnums'
import {r} from 'rethinkdb-ts'
import {RDatum, RValue} from '../../database/stricterR'
import NotificationTeamsLimitExceeded from '../../database/types/NotificationTeamsLimitExceeded'
import {DataLoaderWorker} from '../../graphql/graphql'
import isValid from '../../graphql/isValid'
import publishNotification from '../../graphql/public/mutations/helpers/publishNotification'
import getPg from '../../postgres/getPg'
import {appendUserFeatureFlagsQuery} from '../../postgres/queries/generated/appendUserFeatureFlagsQuery'
import sendTeamsLimitEmail from './sendTeamsLimitEmail'

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
    .update({suggestedTier: 'team'})
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

// Sticky team is the team that completed 3 meetings with more than 1 attendee
// and have had at least 1 meeting in the last 30 days
// Warning: the query is very expensive
export const getStickyTeamCount = async (teamIds: string[]): Promise<number> => {
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
        .filter((row) => row('meetingMembers').ge(Threshold.MIN_STICKY_TEAM_MEETING_ATTENDEES))
        .group('teamId')
        .ungroup()
        .filter((row) => row('reduction').count().ge(Threshold.MIN_STICKY_TEAM_MEETINGS))
        .count()
    })
    .run()
}

// Warning: the function might be expensive
const isLimitExceeded = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamIds = teams.map(({id}) => id)

  if (teamIds.length <= Threshold.MAX_PERSONAL_TIER_TEAMS) return false

  const stickyTeamCount = await getStickyTeamCount(teamIds)
  return stickyTeamCount > Threshold.MAX_PERSONAL_TIER_TEAMS
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
  const [organization, teams] = await Promise.all([
    dataLoader.get('organizations').load(orgId),
    dataLoader.get('teamsByOrgIds').load(orgId)
  ])
  const {tierLimitExceededAt, tier, featureFlags, name: orgName} = organization
  const teamIds = teams.map(({id}) => id)

  if (!featureFlags?.includes('teamsLimit')) return

  if (tierLimitExceededAt || tier !== 'starter') return

  if (teamIds.length <= Threshold.MAX_PERSONAL_TIER_TEAMS) return

  const stickyTeamCount = await getStickyTeamCount(teamIds)
  if (stickyTeamCount <= Threshold.MAX_PERSONAL_TIER_TEAMS) return

  const now = new Date()

  // Schedule lock
  await r
    .table('Organization')
    .get(orgId)
    .update({
      tierLimitExceededAt: now,
      scheduledLockAt: new Date(now.getTime() + ms(`${Threshold.PERSONAL_TIER_LOCK_AFTER_DAYS}d`)),
      updatedAt: now
    })
    .run()

  const billingLeaders = await getBillingLeaders(orgId, dataLoader)
  const billingLeadersIds = billingLeaders.map((billingLeader) => billingLeader.id)

  if (organization.activeDomain) {
    await Promise.all([
      enableUsageStats(billingLeadersIds, orgId),
      sendWebsiteNotifications(orgId, billingLeadersIds, dataLoader),
      billingLeaders.map((billingLeader) =>
        sendTeamsLimitEmail({
          user: billingLeader,
          stickyTeamCount,
          orgId,
          orgName,
          emailType: 'thirtyDayWarning'
        })
      )
    ])
  }
}
