import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const removePokerTemplateDimension: MutationResolvers['removePokerTemplateDimension'] = async (
  _source,
  {dimensionId},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const now = new Date()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const dimension = await dataLoader.get('templateDimensions').load(dimensionId)

  // AUTH
  if (!dimension || dimension.removedAt) {
    throw new GraphQLError('Dimension not found', {extensions: {code: 'NOT_FOUND'}})
  }
  // VALIDATION
  const {teamId, templateId} = dimension
  const dimensions = await dataLoader.get('templateDimensionsByTemplateId').load(templateId)
  if (dimensions.length <= 1) {
    throw new GraphQLError('No dimensions remain', {extensions: {code: 'CONFLICT'}})
  }

  // RESOLUTION
  await pg
    .updateTable('TemplateDimension')
    .set({removedAt: now})
    .where('id', '=', dimensionId)
    .execute()
  dataLoader.clearAll('templateDimensions')
  const data = {dimension, templateId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemovePokerTemplateDimensionPayload', data, subOptions)
  return data
}

export default removePokerTemplateDimension
