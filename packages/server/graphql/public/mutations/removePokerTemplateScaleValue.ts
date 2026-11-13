import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const removePokerTemplateScaleValue: MutationResolvers['removePokerTemplateScaleValue'] = async (
  _source,
  {scaleId, label},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const scale = await dataLoader.get('templateScales').load(scaleId)
  if (!scale || scale.removedAt) {
    throw new GraphQLError('Did not find an active scale', {extensions: {code: 'NOT_FOUND'}})
  }
  const {values: oldScaleValues} = scale
  const oldScaleValue = oldScaleValues.find((v) => v.label === label)

  // VALIDATION
  if (!oldScaleValue) {
    throw new GraphQLError('Did not find an old scale value to remove', {
      extensions: {code: 'NOT_FOUND'}
    })
  }

  // RESOLUTION
  await pg
    .deleteFrom('TemplateScaleValue')
    .where('templateScaleId', '=', scaleId)
    .where('label', '=', label)
    .execute()
  dataLoader.clearAll('templateScales')
  const data = {scaleId}
  publish(
    SubscriptionChannel.TEAM,
    scale.teamId,
    'RemovePokerTemplateScalePayload',
    data,
    subOptions
  )
  return data
}

export default removePokerTemplateScaleValue
