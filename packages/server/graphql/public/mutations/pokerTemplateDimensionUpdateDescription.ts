import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const pokerTemplateDimensionUpdateDescription: MutationResolvers['pokerTemplateDimensionUpdateDescription'] =
  async (_source, {dimensionId, description}, {dataLoader, socketId: mutatorId}) => {
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
    const normalizedDescription = description.trim().slice(0, 256) || ''

    // RESOLUTION
    await pg
      .updateTable('TemplateDimension')
      .set({description: normalizedDescription})
      .where('id', '=', dimensionId)
      .execute()
    dataLoader.clearAll('templateDimensions')
    const data = {dimensionId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'PokerTemplateDimensionUpdateDescriptionPayload',
      data,
      subOptions
    )
    return data
  }

export default pokerTemplateDimensionUpdateDescription
