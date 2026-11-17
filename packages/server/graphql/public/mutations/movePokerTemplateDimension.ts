import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const movePokerTemplateDimension: MutationResolvers['movePokerTemplateDimension'] = async (
  _source,
  {dimensionId, sortOrder},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const dimension = await dataLoader.get('templateDimensions').load(dimensionId)

  // AUTH
  if (!dimension || dimension.removedAt) {
    throw new GraphQLError('Dimension not found', {extensions: {code: 'NOT_FOUND'}})
  }
  // RESOLUTION
  const {teamId} = dimension
  await pg.updateTable('TemplateDimension').set({sortOrder}).where('id', '=', dimensionId).execute()
  dataLoader.clearAll('templateDimensions')
  const data = {dimensionId}
  publish(SubscriptionChannel.TEAM, teamId, 'MovePokerTemplateDimensionPayload', data, subOptions)
  return data
}

export default movePokerTemplateDimension
