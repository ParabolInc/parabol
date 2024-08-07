import {GraphQLID, GraphQLNonNull} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import removeIntegrationProviderQuery from '../../postgres/queries/removeIntegrationProvider'
import {getUserId, isSuperUser, isTeamMember, isUserOrgAdmin} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import RemoveIntegrationProviderPayload from '../types/RemoveIntegrationProviderPayload'

const removeIntegrationProvider = {
  name: 'removeIntegrationProvider',
  type: new GraphQLNonNull(RemoveIntegrationProviderPayload),
  description: 'Remove an Integration Provider, and any associated tokens',
  args: {
    providerId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Id of the Integration Provider to remove'
    }
  },
  resolve: async (
    _source: unknown,
    {providerId}: {providerId: string},
    {authToken, dataLoader}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)

    // AUTH
    const providerDbId = IntegrationProviderId.split(providerId)
    const provider = await dataLoader.get('integrationProviders').load(providerDbId)
    if (!provider) return standardError(new Error('Integration Provider not found'))
    const {teamId, orgId, scope} = provider

    if (!isSuperUser(authToken)) {
      if (scope === 'global') {
        return {error: {message: 'Must be a super user to remove a global provider'}}
      }
      if (scope === 'org' && !isUserOrgAdmin(viewerId, orgId!, dataLoader)) {
        return {error: {message: 'Must be a member of the organization that created the provider'}}
      }
      if (scope === 'team' && !isTeamMember(authToken, teamId!)) {
        const team = await dataLoader.get('teams').load(teamId!)
        if (!team || !isUserOrgAdmin(viewerId, team.orgId, dataLoader)) {
          return {error: {message: 'Must be on the team that created the provider'}}
        }
      }
    }

    // RESOLUTION
    await removeIntegrationProviderQuery(providerDbId)

    const data = {userId: viewerId}
    return data
  }
}

export default removeIntegrationProvider
