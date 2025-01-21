import IntegrationProviderId from '../../../../client/shared/gqlIds/IntegrationProviderId'
import TeamMemberIntegrationAuthId from '../../../../client/shared/gqlIds/TeamMemberIntegrationAuthId'
import {TeamMemberIntegrationAuthOAuth1Resolvers} from '../resolverTypes'

const TeamMemberIntegrationAuthOAuth1: TeamMemberIntegrationAuthOAuth1Resolvers = {
  __isTypeOf: ({
    accessToken,
    accessTokenSecret
  }: {
    accessToken: string | undefined | null
    accessTokenSecret: string | undefined | null
  }) => !!(accessToken && accessTokenSecret),
  id: ({id}) => TeamMemberIntegrationAuthId.join(id),
  providerId: ({providerId}) => IntegrationProviderId.join(providerId),
  provider: async ({providerId}, _args, {dataLoader}) => {
    return dataLoader.get('integrationProviders').loadNonNull(providerId)
  }
}

export default TeamMemberIntegrationAuthOAuth1
