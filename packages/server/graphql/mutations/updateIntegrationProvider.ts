import {GraphQLNonNull} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import updateIntegrationProviderQuery from '../../postgres/queries/updateIntegrationProvider'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import UpdateIntegrationProviderInput, {
  IUpdateIntegrationProviderInput
} from '../types/UpdateIntegrationProviderInput'
import UpdateIntegrationProviderPayload from '../types/UpdateIntegrationProviderPayload'
import {notifyWebhookConfigUpdated} from './helpers/notifications/notifyMattermost'

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
    _source,
    {provider}: {provider: IUpdateIntegrationProviderInput},
    context: GQLContext
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const providerDbId = IntegrationProviderId.split(provider.id)
    const currentProvider = await dataLoader.get('integrationProviders').load(providerDbId)
    dataLoader.get('integrationProviders').clear(providerDbId)
    if (!currentProvider) {
      return {error: {message: 'Invalid provider ID'}}
    }
    const {teamId} = currentProvider
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Must be on the team that owns the provider'}}
    }

    // VALIDATION
    const {oAuth2ProviderMetadataInput, webhookProviderMetadataInput, scope} = provider
    if (oAuth2ProviderMetadataInput && webhookProviderMetadataInput) {
      return {error: {message: 'Provided 2 metadata types, expected 1'}}
    }

    // RESOLUTION
    const providerMetadata = oAuth2ProviderMetadataInput || webhookProviderMetadataInput
    await updateIntegrationProviderQuery({
      id: providerDbId,
      scope,
      providerMetadata
    })

    if (currentProvider.service === 'mattermost') {
      const {providerMetadata} = currentProvider
      const {webhookUrl} = providerMetadata
      const newWebhookUrl = provider.webhookProviderMetadataInput?.webhookUrl
      if (newWebhookUrl && newWebhookUrl !== webhookUrl) {
        await notifyWebhookConfigUpdated(newWebhookUrl, viewerId, teamId)
      }
    }
    //TODO: add proper scopes handling here, teamId only exists in provider with team scope
    const data = {userId: viewerId, teamId}
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateIntegrationProvider', data, subOptions)
    return data
  }
}

export default updateIntegrationProvider
