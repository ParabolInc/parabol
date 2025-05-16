import getKysely from '../../../postgres/getKysely'
import {identifyHighestUserTierForOrgId} from '../../../utils/identifyHighestUserTierForOrgId'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const endTrial: MutationResolvers['endTrial'] = async (_source, {orgId}, {dataLoader}) => {
  const pg = getKysely()

  const organization = await dataLoader.get('organizations').load(orgId)
  if (!organization) {
    return {error: {message: 'Organization not found'}}
  }
  // VALIDATION
  if (!organization.trialStartDate) {
    return standardError(new Error('No trial active for org'))
  }

  // RESOLUTION
  await pg.updateTable('Organization').set({trialStartDate: null}).where('id', '=', orgId).execute()

  const initialTrialStartDate = organization.trialStartDate
  organization.trialStartDate = null

  await identifyHighestUserTierForOrgId(orgId, dataLoader)

  return {orgId, trialStartDate: initialTrialStartDate}
}

export default endTrial
