import {sql} from 'kysely'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const toggleAIFeatures: MutationResolvers['toggleAIFeatures'] = async (
  _source,
  {orgId},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()

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
