import {Threshold} from 'parabol-client/types/constEnums'
// Uncomment for easier testing
// import { ThresholdTest as Threshold } from "~/types/constEnums";
import generateUID from '../../generateUID'
import {DataLoaderWorker} from '../../graphql/graphql'
import publishNotification from '../../graphql/public/mutations/helpers/publishNotification'
import getActiveTeamCountByTeamIds from '../../graphql/public/types/helpers/getActiveTeamCountByTeamIds'
import getKysely from '../../postgres/getKysely'
import getTeamIdsByOrgIds from '../../postgres/queries/getTeamIdsByOrgIds'
import {Organization} from '../../postgres/types'
import removeTeamsLimitObjects from './removeTeamsLimitObjects'

const enableUsageStats = async (userIds: string[], orgId: string) => {
  const pg = getKysely()
  await pg
    .updateTable('OrganizationUser')
    .set({suggestedTier: 'team'})
    .where('orgId', '=', orgId)
    .where('userId', 'in', userIds)
    .where('removedAt', 'is', null)
    .execute()
  const featureFlag = await pg
    .selectFrom('FeatureFlag')
    .select(['id'])
    .where('featureName', '=', 'insights')
    .executeTakeFirst()
  if (featureFlag) {
    const values = [...userIds.map((userId) => ({userId, featureFlagId: featureFlag.id}))]
    await pg
      .insertInto('FeatureFlagOwner')
      .values(values)
      .onConflict((oc) => oc.doNothing())
      .execute()
  }
}

const sendWebsiteNotifications = async (
  organization: Organization,
  userIds: string[],
  dataLoader: DataLoaderWorker
) => {
  const pg = getKysely()
  const {id: orgId, name: orgName, picture: orgPicture} = organization
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const notificationsToInsert = userIds.map((userId) => ({
    id: generateUID(),
    type: 'TEAMS_LIMIT_EXCEEDED' as const,
    userId,
    orgId,
    orgName,
    orgPicture
  }))

  await pg.insertInto('Notification').values(notificationsToInsert).execute()
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
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)

  if (!organization.tierLimitExceededAt) {
    return
  }

  if (!(await isLimitExceeded(orgId))) {
    const billingLeadersIds = await dataLoader.get('billingLeadersIdsByOrgId').load(orgId)
    const pg = getKysely()
    await Promise.all([
      pg
        .updateTable('Organization')
        .set({tierLimitExceededAt: null, scheduledLockAt: null, lockedAt: null})
        .where('id', '=', orgId)
        .execute(),
      pg
        .updateTable('OrganizationUser')
        .set({suggestedTier: 'starter'})
        .where('orgId', '=', orgId)
        .where('userId', 'in', billingLeadersIds)
        .where('removedAt', 'is', null)
        .execute(),
      removeTeamsLimitObjects(orgId, dataLoader)
    ])
    dataLoader.get('organizations').clear(orgId)
  }
}
