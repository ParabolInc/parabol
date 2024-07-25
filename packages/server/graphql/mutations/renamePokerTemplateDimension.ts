import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import RenamePokerTemplateDimensionPayload from '../types/RenamePokerTemplateDimensionPayload'

const renamePokerTemplateDimension = {
  description: 'Rename a poker template dimension',
  type: new GraphQLNonNull(RenamePokerTemplateDimensionPayload),
  args: {
    dimensionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve(
    _source: unknown,
    {dimensionId, name}: {dimensionId: string; name: string},
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

    // VALIDATION
    const {teamId} = dimension
    const trimmedName = name.trim().slice(0, Threshold.MAX_POKER_DIMENSION_NAME)
    const normalizedName = trimmedName || 'Unnamed Dimension'

    try {
      await pg
        .updateTable('TemplateDimension')
        .set({name: normalizedName})
        .where('id', '=', dimensionId)
        .execute()
    } catch (e) {
      const error =
        (e as any).constraint === 'TemplateDimension_teamId_name_removedAt_key'
          ? 'Duplicate name dimension'
          : (e as any).message
      return {error: {message: error}}
    }
    dataLoader.clearAll('templateDimensions')
    const data = {dimensionId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'RenamePokerTemplateDimensionPayload',
      data,
      subOptions
    )
    return data
  }
}

export default renamePokerTemplateDimension
