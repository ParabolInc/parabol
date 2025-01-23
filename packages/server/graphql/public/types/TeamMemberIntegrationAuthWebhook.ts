import IntegrationProviderId from '../../../../client/shared/gqlIds/IntegrationProviderId'
import TeamMemberIntegrationAuthId from '../../../../client/shared/gqlIds/TeamMemberIntegrationAuthId'
import {TeamMemberIntegrationAuthWebhookResolvers} from '../resolverTypes'

const TeamMemberIntegrationAuthWebhook: TeamMemberIntegrationAuthWebhookResolvers = {
  __isTypeOf: ({accessToken, refreshToken, scopes}) => !accessToken || !refreshToken || !scopes,
  id: ({id}) => TeamMemberIntegrationAuthId.join(id),
  providerId: ({providerId}) => IntegrationProviderId.join(providerId),
  provider: async ({providerId}, _args, {dataLoader}) => {
    return dataLoader.get('integrationProviders').loadNonNull(providerId)
  },
  events: async ({id}, _args, {dataLoader}) => {
    return dataLoader.get('notificationSettingsByAuthId').load(id)
  }
}

export default TeamMemberIntegrationAuthWebhook
