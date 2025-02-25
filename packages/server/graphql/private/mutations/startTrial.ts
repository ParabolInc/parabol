import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getKysely from '../../../postgres/getKysely'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
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
    pg.updateTable('Team').set({trialStartDate: now}).where('orgId', '=', orgId).execute(),
    removeTeamsLimitObjects(orgId, dataLoader)
  ])
  organization.trialStartDate = now

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])

  return {orgId}
}

export default startTrial
