import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RemovePokerTemplateScalePayload from '../types/RemovePokerTemplateScalePayload'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'

const removePokerTemplateScale = {
  description: 'Remove a scale from a template',
  type: new GraphQLNonNull(RemovePokerTemplateScalePayload),
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
    if (!scale || scale.removedAt) {
      return standardError(new Error('Scale not found'), {userId: viewerId})
    }
    const {teamId} = scale
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('TemplateScale')
      .get(scaleId)
      .update({removedAt: now, updatedAt: now})
      .run()

    const activeTeamScales = await r
      .table('TemplateScale')
      .getAll(teamId, {index: 'teamId'})
      .filter((row) =>
        row('removedAt')
          .default(null)
          .eq(null)
      )
      .run()
    const nextDefaultScaleId =
      activeTeamScales.length > 0
        ? activeTeamScales.map((teamScale) => teamScale.id)[0]
        : SprintPokerDefaults.DEFAULT_SCALE_ID
    await r
      .table('TemplateDimension')
      .getAll(teamId, {index: 'teamId'})
      .filter((row) =>
        row('removedAt')
          .default(null)
          .eq(null)
          .and(row('scaleId').eq(scaleId))
      )
      .update({
        scaleId: nextDefaultScaleId,
        updatedAt: now
      })
      .run()

    const data = {scaleId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemovePokerTemplateScalePayload', data, subOptions)
    return data
  }
}

export default removePokerTemplateScale
