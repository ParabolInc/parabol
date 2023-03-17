import ms from 'ms'
import {Threshold} from 'parabol-client/types/constEnums'
// Uncomment for easier testing
// import { ThresholdTest as Threshold } from "~/types/constEnums";
import {r} from 'rethinkdb-ts'
import NotificationTeamsLimitExceeded from '../../database/types/NotificationTeamsLimitExceeded'
import Organization from '../../database/types/Organization'
import scheduleTeamLimitsJobs from '../../database/types/scheduleTeamLimitsJobs'
import {DataLoaderWorker} from '../../graphql/graphql'
import isValid from '../../graphql/isValid'
import publishNotification from '../../graphql/public/mutations/helpers/publishNotification'
import {domainHasActiveDeals} from '../../hubSpot/hubSpotApi'
import getPg from '../../postgres/getPg'
import {appendUserFeatureFlagsQuery} from '../../postgres/queries/generated/appendUserFeatureFlagsQuery'
import sendToSentry from '../../utils/sendToSentry'
import removeTeamsLimitObjects from './removeTeamsLimitObjects'
import sendTeamsLimitEmail from './sendTeamsLimitEmail'
import getTeamIdsByOrgIds from '../../postgres/queries/getTeamIdsByOrgIds'
import getActiveTeamCountByTeamIds from '../../graphql/public/types/helpers/getActiveTeamCountByTeamIds'

const getBillingLeaderIds = async (orgId: string) => {
  return r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null, role: 'BILLING_LEADER'})
    .coerceTo('array')('userId')
    .run()
}

const getBillingLeaders = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const billingLeaderIds = (await getBillingLeaderIds(orgId)) as unknown as string[]

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
  organization: Organization,
  userIds: string[],
  dataLoader: DataLoaderWorker
) => {
  const {id: orgId, name: orgName, picture: orgPicture} = organization
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const notificationsToInsert = userIds.map((userId) => {
    return new NotificationTeamsLimitExceeded({
      userId,
      orgId,
      orgName,
      orgPicture
    })
  })

  await r.table('Notification').insert(notificationsToInsert).run()

  notificationsToInsert.forEach((notification) => {
    publishNotification(notification, subOptions)
  })
}

// Warning: the function might be expensive
const isLimitExceeded = async (orgId: string) => {
  const teamIds = await getTeamIdsByOrgIds([orgId])
  if (teamIds.length <= Threshold.MAX_STARTER_TIER_TEAMS) {
    return false
  }

  const activeTeamCount = await getActiveTeamCountByTeamIds(teamIds)

  return activeTeamCount >= Threshold.MAX_STARTER_TIER_TEAMS
}

// Warning: the function might be expensive
export const maybeRemoveRestrictions = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const organization = await dataLoader.get('organizations').load(orgId)

  if (!organization.tierLimitExceededAt) {
    return
  }

  if (!(await isLimitExceeded(orgId))) {
    const billingLeadersIds = await getBillingLeaderIds(orgId)
    await Promise.all([
      r
        .table('Organization')
        .get(orgId)
        .update({
          tierLimitExceededAt: null,
          scheduledLockAt: null,
          lockedAt: null,
          updatedAt: new Date()
        })
        .run(),
      r
        .table('OrganizationUser')
        .getAll(r.args(billingLeadersIds), {index: 'userId'})
        .filter({orgId})
        .update({suggestedTier: 'starter'})
        .run(),
      removeTeamsLimitObjects(orgId, dataLoader)
    ])
    dataLoader.get('organizations').clear(orgId)
  }
}

// Warning: the function might be expensive
export const checkTeamsLimit = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const organization = await dataLoader.get('organizations').load(orgId)
  const {tierLimitExceededAt, tier, featureFlags, name: orgName} = organization

  if (!featureFlags?.includes('teamsLimit')) return

  if (tierLimitExceededAt || tier !== 'starter') return

  // if an org is using a free provider, e.g. gmail.com, we can't show them usage stats, so don't send notifications/emails directing them there for now. Issue to fix this here: https://github.com/ParabolInc/parabol/issues/7723
  if (!organization.activeDomain) return

  if (!(await isLimitExceeded(orgId))) return

  const hasActiveDeals = await domainHasActiveDeals(organization.activeDomain)

  if (hasActiveDeals) {
    if (hasActiveDeals instanceof Error) {
      sendToSentry(hasActiveDeals)
    }

    return
  }

  const now = new Date()
  const scheduledLockAt = new Date(now.getTime() + ms(`${Threshold.STARTER_TIER_LOCK_AFTER_DAYS}d`))

  await r
    .table('Organization')
    .get(orgId)
    .update({
      tierLimitExceededAt: now,
      scheduledLockAt,
      updatedAt: now
    })
    .run()
  dataLoader.get('organizations').clear(orgId)

  const billingLeaders = await getBillingLeaders(orgId, dataLoader)
  const billingLeadersIds = billingLeaders.map((billingLeader) => billingLeader.id)

  // wait for usage stats to be enabled as we dont want to send notifications before it's available
  await enableUsageStats(billingLeadersIds, orgId)
  await Promise.all([
    sendWebsiteNotifications(organization, billingLeadersIds, dataLoader),
    billingLeaders.map((billingLeader) =>
      sendTeamsLimitEmail({
        user: billingLeader,
        orgId,
        orgName,
        emailType: 'thirtyDayWarning'
      })
    ),
    scheduleTeamLimitsJobs(scheduledLockAt, orgId)
  ])
}
