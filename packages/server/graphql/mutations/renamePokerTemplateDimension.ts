import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {RDatum} from '../../database/stricterR'
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

    // VALIDATION
    const {teamId, templateId} = dimension
    const trimmedName = name.trim().slice(0, Threshold.MAX_POKER_DIMENSION_NAME)
    const normalizedName = trimmedName || 'Unnamed Dimension'

    const allDimensions = await r
      .table('TemplateDimension')
      .getAll(teamId, {index: 'teamId'})
      .filter({templateId})
      .filter((row: RDatum) => row('removedAt').default(null).eq(null))
      .run()
    if (allDimensions.find((dimension) => dimension.name === normalizedName)) {
      return standardError(new Error('Duplicate name dimension'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('TemplateDimension')
      .get(dimensionId)
      .update({
        name: normalizedName,
        updatedAt: now
      })
      .run()

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
