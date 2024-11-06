import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const toggleAIFeatures: MutationResolvers['toggleAIFeatures'] = async (
  _source,
  {orgId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  // VALIDATION
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  if (!organization.isOrgAdmin) {
    return {error: {message: 'Must be organization admin to toggle AI features'}}
  }

  // RESOLUTION
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const [{useAI: currentValue}] = await pg
    .selectFrom('Organization')
    .select('useAI')
    .where('id', '=', orgId)
    .execute()

  await pg.updateTable('Organization').set({useAI: !currentValue}).where('id', '=', orgId).execute()

  const data = {
    orgId,
    useAI: !currentValue
  }

  publish(SubscriptionChannel.ORGANIZATION, orgId, 'ToggleAIFeaturesPayload', data, subOptions)
  return data
}

export default toggleAIFeatures
