import {GraphQLID, GraphQLNonNull} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import removeIntegrationProviderQuery from '../../postgres/queries/removeIntegrationProvider'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import RemoveIntegrationProviderPayload from '../types/RemoveIntegrationProviderPayload'

const removeIntegrationProvider = {
  name: 'RemoveIntegrationProvider',
  type: new GraphQLNonNull(RemoveIntegrationProviderPayload),
  description: 'Remove an Integration Provider, and any associated tokens',
  args: {
    providerId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Id of the Integration Provider to remove'
    }
  },
  resolve: async (_source, {providerId}: {providerId: string}, context: GQLContext) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const providerDbId = IntegrationProviderId.split(providerId)
    const provider = await dataLoader.get('integrationProviders').load(providerDbId)
    if (!provider) return standardError(new Error('Integration Provider not found'))
    const {teamId} = provider
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Must be on the team that created the provider'}}
    }

    // RESOLUTION
    await removeIntegrationProviderQuery(providerDbId)

    //TODO: add proper scopes handling here, teamId only exists in provider with team scope
    const data = {userId: getUserId(authToken), teamId}
    publish(SubscriptionChannel.TEAM, teamId!, 'RemoveIntegrationProvider', data, subOptions)
    return data
  }
}

export default removeIntegrationProvider
