import {GraphQLNonNull} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import upsertIntegrationProvider from '../../postgres/queries/upsertIntegrationProvider'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import UpdateIntegrationProviderInput, {
  IUpdateIntegrationProviderInput
} from '../types/UpdateIntegrationProviderInput'
import UpdateIntegrationProviderPayload from '../types/UpdateIntegrationProviderPayload'
import {MattermostNotifier} from './helpers/notifications/MattermostNotifier'

const updateIntegrationProvider = {
  name: 'UpdateIntegrationProvider',
  type: GraphQLNonNull(UpdateIntegrationProviderPayload),
  description: 'Update the Integration Provider settings',
  args: {
    provider: {
      type: GraphQLNonNull(UpdateIntegrationProviderInput),
      description: 'The new Integration Provider'
    }
  },
  resolve: async (
    _source: unknown,
    {provider}: {provider: IUpdateIntegrationProviderInput},
    context: GQLContext
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const {
      id: providerId,
      webhookProviderMetadataInput,
      oAuth2ProviderMetadataInput,
      scope
    } = provider
    const providerDbId = IntegrationProviderId.split(providerId)
    const currentProvider = await dataLoader.get('integrationProviders').load(providerDbId)
    dataLoader.get('integrationProviders').clear(providerDbId)
    if (!currentProvider) {
      return {error: {message: 'Invalid provider ID'}}
    }
    const {teamId, service, authStrategy} = currentProvider
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Must be on the team that owns the provider'}}
    }

    // VALIDATION
    if (oAuth2ProviderMetadataInput && webhookProviderMetadataInput) {
      return {error: {message: 'Provided 2 metadata types, expected 1'}}
    }
    if (!oAuth2ProviderMetadataInput && !webhookProviderMetadataInput) {
      return {error: {message: 'Provided 0 metadata types, expected 1'}}
    }

    // RESOLUTION
    await upsertIntegrationProvider({
      ...oAuth2ProviderMetadataInput,
      ...webhookProviderMetadataInput,
      service,
      authStrategy,
      teamId,
      scope
    })

    if (currentProvider.service === 'mattermost') {
      const {webhookUrl} = currentProvider
      const newWebhookUrl = webhookProviderMetadataInput?.webhookUrl
      if (newWebhookUrl && newWebhookUrl !== webhookUrl) {
        Object.assign(currentProvider, webhookProviderMetadataInput)
        await MattermostNotifier.integrationUpdated(dataLoader, teamId, viewerId)
      }
    }
    const data = {userId: viewerId, teamId, providerId: providerDbId}
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateIntegrationProviderSuccess', data, subOptions)
    return data
  }
}

export default updateIntegrationProvider
