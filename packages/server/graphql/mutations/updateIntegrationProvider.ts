import {GraphQLNonNull} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import upsertIntegrationProvider from '../../postgres/queries/upsertIntegrationProvider'
import {getUserId, isSuperUser, isTeamMember, isUserOrgAdmin} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import UpdateIntegrationProviderInput, {
  IUpdateIntegrationProviderInput
} from '../types/UpdateIntegrationProviderInput'
import UpdateIntegrationProviderPayload from '../types/UpdateIntegrationProviderPayload'
import {MSTeamsNotifier} from './helpers/notifications/MSTeamsNotifier'
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
      scope: newScope
    } = provider
    const providerDbId = IntegrationProviderId.split(providerId)
    const currentProvider = await dataLoader.get('integrationProviders').load(providerDbId)
    dataLoader.get('integrationProviders').clear(providerDbId)
    if (!currentProvider) {
      return {error: {message: 'Invalid provider ID'}}
    }
    const {teamId, orgId, scope: oldScope, service, authStrategy} = currentProvider

    if (!isSuperUser(authToken)) {
      if (oldScope === 'global' || newScope === 'global') {
        return {error: {message: 'Must be a super user to add a global provider'}}
      }
      if (
        (oldScope === 'org' || newScope === 'org') &&
        !isUserOrgAdmin(viewerId, orgId!, dataLoader)
      ) {
        return {
          error: {
            message:
              'Must be an organization admin to add an integration provider on organization level'
          }
        }
      }
      if (oldScope === 'team' && newScope === 'team' && !isTeamMember(authToken, teamId!)) {
        return {error: {message: 'Must be on the team for the integration provider'}}
      }
    }

    // VALIDATION
    if (oAuth2ProviderMetadataInput && webhookProviderMetadataInput) {
      return {error: {message: 'Provided 2 metadata types, expected 1'}}
    }
    if (!oAuth2ProviderMetadataInput && !webhookProviderMetadataInput) {
      return {error: {message: 'Provided 0 metadata types, expected 1'}}
    }

    const resolvedOrgId =
      orgId || (teamId ? (await dataLoader.get('teams').loadNonNull(teamId)).orgId : null)
    const scope = newScope || oldScope

    // RESOLUTION
    await upsertIntegrationProvider({
      ...oAuth2ProviderMetadataInput,
      ...webhookProviderMetadataInput,
      service,
      authStrategy,
      scope: newScope,
      ...(scope === 'global'
        ? {orgId: null, teamId: null}
        : scope === 'org'
          ? {orgId, teamId: null}
          : {orgId: null, teamId})
    })

    if (currentProvider.service === 'mattermost') {
      const {webhookUrl} = currentProvider
      const newWebhookUrl = webhookProviderMetadataInput?.webhookUrl
      if (teamId && newWebhookUrl && newWebhookUrl !== webhookUrl) {
        Object.assign(currentProvider, webhookProviderMetadataInput)
        await MattermostNotifier.integrationUpdated(dataLoader, teamId, viewerId)
      }
    }
    if (currentProvider.service === 'msTeams') {
      const {webhookUrl} = currentProvider
      const newWebhookUrl = webhookProviderMetadataInput?.webhookUrl
      if (teamId && newWebhookUrl && newWebhookUrl !== webhookUrl) {
        Object.assign(currentProvider, webhookProviderMetadataInput)
        await MSTeamsNotifier.integrationUpdated(dataLoader, teamId, viewerId)
      }
    }
    const data = {userId: viewerId, providerId: providerDbId}
    if (resolvedOrgId) {
      publish(
        SubscriptionChannel.ORGANIZATION,
        resolvedOrgId,
        'UpdateIntegrationProviderSuccess',
        data,
        subOptions
      )
    }
    return data
  }
}

export default updateIntegrationProvider
