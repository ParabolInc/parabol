import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getKysely from '../../../postgres/getKysely'
import {identifyHighestUserTierForOrgId} from '../../../utils/identifyHighestUserTierForOrgId'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const startTrial: MutationResolvers['startTrial'] = async (_source, {orgId}, {dataLoader}) => {
  const pg = getKysely()
  const now = new Date()
  const organization = await dataLoader.get('organizations').load(orgId)
  if (!organization) {
    return {error: {message: 'Organization not found'}}
  }
  // VALIDATION
  if (organization.tier !== 'starter') {
    return standardError(new Error('Cannot start trial for organization on paid tier'))
  }
  if (organization.trialStartDate) {
    return standardError(
      new Error(`Trial already started for org. Start date: ${organization.trialStartDate}`)
    )
  }

  // RESOLUTION
  await Promise.all([
    pg
      .updateTable('Organization')
      .set({trialStartDate: now, tierLimitExceededAt: null, scheduledLockAt: null, lockedAt: null})
      .where('id', '=', orgId)
      .execute(),
    removeTeamsLimitObjects(orgId, dataLoader)
  ])
  organization.trialStartDate = now

  await identifyHighestUserTierForOrgId(orgId, dataLoader)

  return {orgId}
}

export default startTrial
