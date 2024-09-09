import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import PokerTemplateDimensionUpdateDescriptionPayload from '../types/PokerTemplateDimensionUpdateDescriptionPayload'

const pokerTemplateDimensionUpdateDescription = {
  description: 'Update the description of a poker template dimension',
  type: PokerTemplateDimensionUpdateDescriptionPayload,
  args: {
    dimensionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    description: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve(
    _source: unknown,
    {dimensionId, description}: {dimensionId: string; description: string},
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
}

export default pokerTemplateDimensionUpdateDescription
