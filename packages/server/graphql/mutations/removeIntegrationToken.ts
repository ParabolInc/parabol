import {GraphQLID, GraphQLNonNull} from 'graphql'
import {getUserId, isSuperUser, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import RemoveIntegrationTokenPayload from '../types/RemoveIntegrationTokenPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'
import standardError from '../../utils/standardError'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import removeIntegrationTokenQuery from '../../postgres/queries/removeIntegrationToken'

const removeIntegrationToken = {
  type: GraphQLNonNull(RemoveIntegrationTokenPayload),
  description: ``,
  args: {
    providerId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The Integration Provider id related to the token'
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The team id related to the token'
    }
  },
  resolve: async (
    _source,
    {providerId, teamId}: {providerId: string; teamId: string},
    context: GQLContext
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    if (!isTeamMember(authToken, teamId) && !isSuperUser(authToken))
      return standardError(new Error('persmission denied; must be team member'))

    // VALIDATION
    const providerDbId = IntegrationProviderId.split(providerId)
    if (!providerDbId) return standardError(new Error('invalid providerId'))

    // RESOLUTION
    await removeIntegrationTokenQuery(providerDbId, teamId, viewerId)

    const data = {userId: viewerId, teamId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveIntegrationToken', data, subOptions)
    return data
  }
}

export default removeIntegrationToken
