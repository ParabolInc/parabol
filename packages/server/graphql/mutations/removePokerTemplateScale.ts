import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RemovePokerTemplateScalePayload from '../types/RemovePokerTemplateScalePayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

const removePokerTemplateScale = {
  description: 'Remove a scale from a template',
  type: RemovePokerTemplateScalePayload,
  args: {
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(_source, {scaleId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const scale = await r
      .table('TemplateScale')
      .get(scaleId)
      .run()
    const viewerId = getUserId(authToken)

    // AUTH
    const {teamId} = scale
    if (!scale || !isTeamMember(authToken, teamId) || !scale.isActive) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('TemplateScale')
      .get(scaleId)
      .update({
        isActive: false,
        updatedAt: now
      })
      .run()

    const data = {scaleId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemovePokerTemplateScalePayload', data, subOptions)
    return data
  }
}

export default removePokerTemplateScale
