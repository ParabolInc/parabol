import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import RemovePokerTemplateDimensionPayload from '../types/RemovePokerTemplateDimensionPayload'

const removePokerTemplateDimension = {
  description: 'Remove a dimension from a template',
  type: new GraphQLNonNull(RemovePokerTemplateDimensionPayload),
  args: {
    dimensionId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source: unknown,
    {dimensionId}: {dimensionId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const pg = getKysely()
    const now = new Date()
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
    const {teamId, templateId} = dimension
    const dimensions = await dataLoader.get('templateDimensionsByTemplateId').load(templateId)

    if (dimensions.length <= 1) {
      return standardError(new Error('No dimensions remain'), {userId: viewerId})
    }

    // RESOLUTION
    await pg
      .updateTable('TemplateDimension')
      .set({removedAt: now})
      .where('id', '=', dimensionId)
      .execute()
    dataLoader.clearAll('templateDimensions')
    const data = {dimensionId, templateId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'RemovePokerTemplateDimensionPayload',
      data,
      subOptions
    )
    return data
  }
}

export default removePokerTemplateDimension
