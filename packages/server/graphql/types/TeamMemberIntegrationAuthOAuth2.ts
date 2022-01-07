import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import IntegrationProviderOAuth2 from './IntegrationProviderOAuth2'
import TeamMemberIntegrationAuth, {
  teamMemberIntegrationAuthFields
} from './TeamMemberIntegrationAuth'

const TeamMemberIntegrationAuthOAuth2 = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamMemberIntegrationAuthOAuth2',
  description: 'An integration token that connects via OAuth2',
  interfaces: () => [TeamMemberIntegrationAuth],
  isTypeOf: ({accessToken, refreshToken, scopes}) => accessToken && refreshToken && scopes,
  fields: () => ({
    ...teamMemberIntegrationAuthFields(),
    accessToken: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The token used to connect to the provider'
    },
    scopes: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The scopes allowed on the provider'
    },
    provider: {
      description: 'The provider strategy this token connects to',
      type: new GraphQLNonNull(IntegrationProviderOAuth2),
      resolve: async ({providerId}, _args, {dataLoader}) => {
        return dataLoader.get('integrationProviders').load(providerId)
      }
    }
  })
})

export default TeamMemberIntegrationAuthOAuth2
