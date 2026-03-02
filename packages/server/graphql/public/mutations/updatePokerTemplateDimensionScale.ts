import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const updatePokerTemplateDimensionScale: MutationResolvers['updatePokerTemplateDimensionScale'] =
  async (_source, {dimensionId, scaleId}, {authToken, dataLoader, socketId: mutatorId}) => {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const dimension = await dataLoader.get('templateDimensions').load(dimensionId)
    const viewerId = getUserId(authToken)

    // AUTH
    if (!dimension || dimension.removedAt) {
      return standardError(new Error('Dimension not found'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, dimension.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {teamId} = dimension
    const scale = await dataLoader.get('templateScales').load(scaleId)
    if (!scale || scale.removedAt || (!scale.isStarter && scale.teamId !== teamId)) {
      return standardError(new Error('Scale not found'), {userId: viewerId})
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
