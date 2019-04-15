import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import IntegrationServiceEnum from 'server/graphql/types/IntegrationServiceEnum'

const ProviderRow = new GraphQLObjectType({
  name: 'ProviderRow',
  description: 'All the details about a particular provider',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'composite keyID',
      resolve: ({teamId, service}) => `${service}:${teamId}`
    },
    accessToken: {
      type: GraphQLID,
      description:
        'The access token attached to the userId. null if user does not have a token for the provider'
    },
    userCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description:
        'The count of all the people on the team that have linked their account to the provider'
    },
    integrationCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of integrations under this provider for the team'
    },
    providerUserName: {
      type: GraphQLString,
      description: 'The username according to the provider'
    },
    service: {
      type: IntegrationServiceEnum,
      description: 'The name of the service'
    },
    teamId: {
      type: GraphQLID
    }
  })
})

export default ProviderRow
