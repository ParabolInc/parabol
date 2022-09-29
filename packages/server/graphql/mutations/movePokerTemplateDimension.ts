import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import MovePokerTemplateDimensionPayload from '../types/MovePokerTemplateDimensionPayload'

const movePokerTemplateDimension = {
  description: 'Move a template dimension',
  type: new GraphQLNonNull(MovePokerTemplateDimensionPayload),
  args: {
    dimensionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat)
    }
  },
  async resolve(
    _source: unknown,
    {dimensionId, sortOrder}: {dimensionId: string; sortOrder: number},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const dimension = await r.table('TemplateDimension').get(dimensionId).run()
    const viewerId = getUserId(authToken)

    // AUTH
    if (!dimension || dimension.removedAt) {
      return standardError(new Error('Dimension not found'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, dimension.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('TemplateDimension')
      .get(dimensionId)
      .update({
        sortOrder,
        updatedAt: now
      })
      .run()

    const {teamId} = dimension
    const data = {dimensionId}
    publish(SubscriptionChannel.TEAM, teamId, 'MovePokerTemplateDimensionPayload', data, subOptions)
    return data
  }
}

export default movePokerTemplateDimension
