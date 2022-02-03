import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import IntegrationProviderOAuth1 from './IntegrationProviderOAuth1'
import TeamMemberIntegrationAuth, {
  teamMemberIntegrationAuthFields
} from './TeamMemberIntegrationAuth'

const TeamMemberIntegrationAuthOAuth1 = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamMemberIntegrationAuthOAuth1',
  description: 'An integration token that connects via OAuth1',
  interfaces: () => [TeamMemberIntegrationAuth],
  isTypeOf: ({
    accessToken,
    accessTokenSecret
  }: {
    accessToken: string | undefined | null
    accessTokenSecret: string | undefined | null
  }) => !!(accessToken && accessTokenSecret),
  fields: () => ({
    ...teamMemberIntegrationAuthFields(),
    provider: {
      description: 'The provider strategy this token connects to',
      type: new GraphQLNonNull(IntegrationProviderOAuth1),
      resolve: async ({providerId}: {providerId: string}, _args, {dataLoader}) => {
        return dataLoader.get('integrationProviders').load(providerId)
      }
    }
  })
})

export default TeamMemberIntegrationAuthOAuth1
