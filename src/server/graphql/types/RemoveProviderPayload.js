import {GraphQLNonNull, GraphQLObjectType, GraphQLList, GraphQLID} from 'graphql'
import ProviderRow from 'server/graphql/types/ProviderRow'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const RemoveProviderPayload = new GraphQLObjectType({
  name: 'RemoveProviderPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    providerRow: {
      type: ProviderRow
    },
    deletedIntegrationIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      description: 'The globalIds of the removed integrations'
    },
    userId: {
      type: GraphQLID,
      description: 'The userId of the person who removed the provider'
    },
    archivedTaskIds: {
      type: new GraphQLList(GraphQLID)
    }
  })
})

export default RemoveProviderPayload
