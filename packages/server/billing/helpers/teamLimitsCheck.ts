import ms from 'ms'
import {Threshold} from 'parabol-client/types/constEnums'
import {r} from 'rethinkdb-ts'
import {RDatum, RValue} from '../../database/stricterR'
import NotificationTeamsLimitExceeded from '../../database/types/NotificationTeamsLimitExceeded'
import ScheduledJobOrganizationLock from '../../database/types/ScheduledJobOrganizationLock'
import {DataLoaderWorker} from '../../graphql/graphql'
import isValid from '../../graphql/isValid'
import publishNotification from '../../graphql/public/mutations/helpers/publishNotification'
import getPg from '../../postgres/getPg'
import {appendUserFeatureFlagsQuery} from '../../postgres/queries/generated/appendUserFeatureFlagsQuery'

// Uncomment for easier testing
// const enum Threshold {
//   MAX_PERSONAL_TIER_TEAMS = 0,
//   MIN_STICKY_TEAM_MEETING_ATTENDEES = 1,
//   MIN_STICKY_TEAM_MEETINGS = 1,
//   PERSONAL_TIER_LOCK_AFTER_DAYS = 0
// }

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

const scheduleJobs = async (scheduledLockAt: Date, orgId: string) => {
  const scheduledLock = r
    .table('ScheduledJob')
    .insert(new ScheduledJobOrganizationLock(scheduledLockAt, orgId))
    .run()

  // TODO: implement additional reminders
  // const scheduleFirstReminder
  // const scheduleSecondReminder

  await Promise.all([scheduledLock])
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

const isLimitExceeded = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamIds = teams.map(({id}) => id)

  if (teamIds.length <= Threshold.MAX_PERSONAL_TIER_TEAMS) {
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
        .filter((row) => row('meetingMembers').ge(Threshold.MIN_STICKY_TEAM_MEETING_ATTENDEES))
        .group('teamId')
        .ungroup()
        .filter((row) => row('reduction').count().ge(Threshold.MIN_STICKY_TEAM_MEETINGS))
        .count()
        .gt(Threshold.MAX_PERSONAL_TIER_TEAMS)
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

  if (organization.tierLimitExceededAt || organization.tier !== 'starter') {
    return
  }

  if (!(await isLimitExceeded(orgId, dataLoader))) {
    return
  }

  const now = new Date()

  const scheduledLockAt = new Date(
    now.getTime() + ms(`${Threshold.PERSONAL_TIER_LOCK_AFTER_DAYS}d`)
  )

  await r
    .table('Organization')
    .get(orgId)
    .update({
      tierLimitExceededAt: now,
      scheduledLockAt,
      updatedAt: now
    })
    .run()

  const billingLeaders = await getBillingLeaders(orgId, dataLoader)
  const billingLeadersIds = billingLeaders.map((billingLeader) => billingLeader.id)

  if (organization.activeDomain) {
    await enableUsageStats(billingLeadersIds, orgId)
    await sendWebsiteNotifications(orgId, billingLeadersIds, dataLoader)
  }

  await scheduleJobs(scheduledLockAt, orgId)
}

export const processLockOrganizationJob = async (
  job: ScheduledJobOrganizationLock,
  dataLoader: DataLoaderWorker
) => {
  const {orgId, runAt} = job

  const organization = await dataLoader.get('organizations').load(orgId)

  // Skip the job if unlocked or already locked or scheduled lock date changed
  if (
    !organization.scheduledLockAt ||
    organization.lockedAt ||
    organization.scheduledLockAt.getTime() !== runAt.getTime()
  ) {
    return
  }

  const now = new Date()

  return r
    .table('Organization')
    .get(orgId)
    .update({
      lockedAt: now
    })
    .run()
}
