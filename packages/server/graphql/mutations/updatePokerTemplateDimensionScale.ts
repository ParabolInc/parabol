import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import AddPokerTemplateDimensionPayload from '../types/AddPokerTemplateDimensionPayload'

const updatePokerTemplateDimensionScale = {
  description: 'Update the scale used for a dimension in a template',
  type: AddPokerTemplateDimensionPayload,
  args: {
    dimensionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(_source, {dimensionId, scaleId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const dimension = await r
      .table('TemplateDimension')
      .get(dimensionId)
      .run()
    const viewerId = getUserId(authToken)
    const teamId = dimension.teamId

    // AUTH
    if (!isTeamMember(authToken, dimension.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (!dimension || !dimension.isActive) {
      return standardError(new Error('Dimension not found'), {userId: viewerId})
    }

    // VALIDATION
    const scale = await r
      .table('TemplateScale')
      .get(scaleId)
      .run()
    if (
      !scale ||
      !scale.isActive ||
      scale.teamId !== teamId
    ) {
      return standardError(new Error('Scale not found'), {userId: viewerId})
    }

    await r
      .table('TemplateDimension')
      .get(dimensionId)
      .update({scaleId})
      .run()

    const data = {dimensionId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddPokerTemplateDimensionPayload', data, subOptions)
    return data
  }
}

export default updatePokerTemplateDimensionScale
