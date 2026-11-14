import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updatePokerTemplateDimensionScale: MutationResolvers['updatePokerTemplateDimensionScale'] =
  async (_source, {dimensionId, scaleId}, {dataLoader, socketId: mutatorId}) => {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const dimension = await dataLoader.get('templateDimensions').load(dimensionId)

    // VALIDATION
    if (!dimension || dimension.removedAt) {
      throw new GraphQLError('Dimension not found', {extensions: {code: 'NOT_FOUND'}})
    }

    // VALIDATION
    const {teamId} = dimension
    const scale = await dataLoader.get('templateScales').load(scaleId)
    if (!scale || scale.removedAt || (!scale.isStarter && scale.teamId !== teamId)) {
      throw new GraphQLError('Scale not found', {extensions: {code: 'NOT_FOUND'}})
    }

    await pg.updateTable('TemplateDimension').set({scaleId}).where('id', '=', dimensionId).execute()
    dataLoader.get('templateDimensions').clear(dimensionId)
    const data = {dimensionId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'UpdatePokerTemplateDimensionScalePayload',
      data,
      subOptions
    )
    return data
  }

export default updatePokerTemplateDimensionScale
