import {GraphQLID, GraphQLNonNull} from 'graphql'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import RemoveIntegrationProviderPayload from '../types/RemoveIntegrationProviderPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {auth} from './helpers/integrationProviderHelpers'
import removeIntegrationProviderQuery from '../../postgres/queries/removeIntegrationProvider'
import standardError from '../../utils/standardError'

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
    const {teamId, orgId} = provider
    const authResult = auth(provider, authToken, teamId, orgId, dataLoader)
    if (authResult instanceof Error) return standardError(authResult)

    // VALIDATION
    // nothing futher to validate

    // RESOLUTION
    await removeIntegrationProviderQuery(providerDbId)

    const data = {userId: getUserId(authToken), teamId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveIntegrationProvider', data, subOptions)
    return data
  }
}

export default removeIntegrationProvider
