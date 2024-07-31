import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../postgres/getKysely'
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
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve(
    _source: unknown,
    {dimensionId, sortOrder}: {dimensionId: string; sortOrder: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
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

    // RESOLUTION
    const {teamId} = dimension

    await pg
      .updateTable('TemplateDimension')
      .set({sortOrder})
      .where('id', '=', dimensionId)
      .execute()
    dataLoader.clearAll('templateDimensions')
    const data = {dimensionId}
    publish(SubscriptionChannel.TEAM, teamId, 'MovePokerTemplateDimensionPayload', data, subOptions)
    return data
  }
}

export default movePokerTemplateDimension
