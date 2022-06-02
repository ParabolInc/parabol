import {GraphQLID, GraphQLNonNull} from 'graphql'
import {IntegrationProviderServiceEnum as TIntegrationProviderServiceEnum} from '../../postgres/queries/generated/getIntegrationProvidersByIdsQuery'
import removeTeamMemberIntegrationAuthQuery from '../../postgres/queries/removeTeamMemberIntegrationAuth'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import IntegrationProviderServiceEnum from '../types/IntegrationProviderServiceEnum'
import RemoveTeamMemberIntegrationAuthPayload from '../types/RemoveTeamMemberIntegrationAuthPayload'

const removeTeamMemberIntegrationAuth = {
  type: GraphQLNonNull(RemoveTeamMemberIntegrationAuthPayload),
  description: 'Remove the integrated auth for a given team member',
  args: {
    service: {
      type: GraphQLNonNull(IntegrationProviderServiceEnum),
      description: 'The Integration Provider service name related to the token'
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The team id related to the token'
    }
  },
  resolve: async (
    _source: unknown,
    {service, teamId}: {service: TIntegrationProviderServiceEnum; teamId: string},
    context: GQLContext
  ) => {
    const {authToken} = context
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId))
      return standardError(new Error('permission denied; must be team member'))

    // RESOLUTION
    await removeTeamMemberIntegrationAuthQuery(service, teamId, viewerId)
    analytics.integrationRemoved(viewerId, teamId, service)

    const data = {userId: viewerId, teamId}
    return data
  }
}

export default removeTeamMemberIntegrationAuth
