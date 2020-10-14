import {GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RemovePokerTemplateScaleValuePayload from '../types/RemovePokerTemplateScaleValuePayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

const removePokerTemplateScaleValue = {
  description: 'Remove a scale value from the scale of a template',
  type: new GraphQLNonNull(RemovePokerTemplateScaleValuePayload),
  args: {
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    index: {
      type: GraphQLInt,
      description: 'Index of the scale value to be deleted. Default to the last scale value.'
    }
  },
  async resolve(_source, {scaleId, index}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const scale = await r
      .table('TemplateScale')
      .get(scaleId)
      .run()
    if (!scale || scale.removedAt) {
      return standardError(new Error('Did not find an active scale'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, scale.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const endIndex = scale.values.length - 1
    if (index > endIndex || index < 0) {
      return standardError(new Error('Invalid index'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('TemplateScale')
      .get(scaleId)
      .update((row) => ({
        values: row('values').deleteAt(index || endIndex),
        updatedAt: now
      }))
      .run()

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
}

export default removePokerTemplateScaleValue
