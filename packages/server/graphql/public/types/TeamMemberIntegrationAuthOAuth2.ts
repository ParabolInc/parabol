import IntegrationProviderId from '../../../../client/shared/gqlIds/IntegrationProviderId'
import TeamMemberIntegrationAuthId from '../../../../client/shared/gqlIds/TeamMemberIntegrationAuthId'
import {TeamMemberIntegrationAuthOAuth2Resolvers} from '../resolverTypes'

const TeamMemberIntegrationAuthOAuth2: TeamMemberIntegrationAuthOAuth2Resolvers = {
  __isTypeOf: ({accessToken, scopes}) => !!(accessToken && scopes),
  id: ({id}) => TeamMemberIntegrationAuthId.join(id),
  providerId: ({providerId}) => IntegrationProviderId.join(providerId),
  provider: async ({providerId}, _args, {dataLoader}) => {
    return dataLoader.get('integrationProviders').loadNonNull(providerId)
  }
}

export default TeamMemberIntegrationAuthOAuth2
