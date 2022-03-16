import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
// import isValid from '../isValid'
// import IntegrationProviderOAuth2 from './IntegrationProviderOAuth2'
// import TeamMemberIntegrationAuthOAuth2 from './TeamMemberIntegrationAuthOAuth2'

const ADOIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'ADOIntegration',
  description: 'Azure DevOps integration data for a given team member',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'composite key',
      resolve: ({teamId, userId}) => `${teamId}|${userId}`
    },
    accessToken: {
      description: 'The access token to ADO. good forever',
      type: GraphQLID,
      resolve: async ({accessToken, userId}, _args: unknown, {authToken}) => {
        const viewerId = getUserId(authToken)
        return viewerId === userId ? accessToken : null
      }
    },
    isActive: {
      description: 'true if an access token exists, else false',
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({accessToken}) => !!accessToken
    }
  })
})
export default ADOIntegration
