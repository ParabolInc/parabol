import {GraphQLError} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const renamePokerTemplateDimension: MutationResolvers['renamePokerTemplateDimension'] = async (
  _source,
  {dimensionId, name},
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
  // VALIDATION
  const {teamId} = dimension
  const trimmedName = name.trim().slice(0, Threshold.MAX_POKER_DIMENSION_NAME)
  const normalizedName = trimmedName || 'Unnamed Dimension'

  try {
    await pg
      .updateTable('TemplateDimension')
      .set({name: normalizedName})
      .where('id', '=', dimensionId)
      .execute()
  } catch (e) {
    if (
      e instanceof Error &&
      'constraint' in e &&
      e.constraint === 'TemplateDimension_teamId_name_removedAt_key'
    ) {
      throw new GraphQLError('Duplicate name dimension', {extensions: {code: 'CONFLICT'}})
    }
    throw e
  }
  dataLoader.clearAll('templateDimensions')
  const data = {dimensionId}
  publish(SubscriptionChannel.TEAM, teamId, 'RenamePokerTemplateDimensionPayload', data, subOptions)
  return data
}

export default renamePokerTemplateDimension
