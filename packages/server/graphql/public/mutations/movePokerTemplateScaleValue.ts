import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getSortOrder} from '../../../../client/shared/sortOrder'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const movePokerTemplateScaleValue: MutationResolvers['movePokerTemplateScaleValue'] = async (
  _source,
  {scaleId, label, index},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const scale = await dataLoader.get('templateScales').load(scaleId)

  // AUTH
  if (!scale || scale.removedAt) {
    throw new GraphQLError('Did not find an active scale', {extensions: {code: 'NOT_FOUND'}})
  }
  // VALIDATION
  const itemIdx = scale.values.findIndex((scaleValue) => scaleValue.label === label)
  if (itemIdx === -1) {
    throw new GraphQLError('Did not find an existing scale value to move', {
      extensions: {code: 'NOT_FOUND'}
    })
  }
  if (index < 0 || index >= scale.values.length - 2) {
    throw new GraphQLError('Invalid index to move to', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  // RESOLUTION
  const sortOrder = getSortOrder(scale.values, itemIdx, index)
  await pg
    .updateTable('TemplateScaleValue')
    .set({sortOrder})
    .where('templateScaleId', '=', scale.id)
    .where('label', '=', label)
    .execute()
  dataLoader.clearAll('templateScales')
  const data = {scaleId}
  publish(
    SubscriptionChannel.TEAM,
    scale.teamId,
    'MovePokerTemplateScaleValueSuccess',
    data,
    subOptions
  )
  return data
}

export default movePokerTemplateScaleValue
