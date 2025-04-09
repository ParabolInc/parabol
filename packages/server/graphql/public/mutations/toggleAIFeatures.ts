import {sql} from 'kysely'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isSuperUser, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const toggleAIFeatures: MutationResolvers['toggleAIFeatures'] = async (
  _source,
  {orgId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  const canAccess = (await isUserOrgAdmin(viewerId, orgId, dataLoader)) || isSuperUser(authToken)
  // VALIDATION
  if (!canAccess) {
    return standardError(new Error('Not organization admin'))
  }

  // RESOLUTION
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  await pg
    .updateTable('Organization')
    .set({useAI: sql`NOT "useAI"`})
    .where('id', '=', orgId)
    .execute()

  const data = {
    orgId
  }

  publish(SubscriptionChannel.ORGANIZATION, orgId, 'ToggleAIFeaturesPayload', data, subOptions)
  return data
}

export default toggleAIFeatures
