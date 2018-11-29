import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLList} from 'graphql'
import ProviderRow from 'server/graphql/types/ProviderRow'
import Provider from 'server/graphql/types/Provider'
import TeamMember from 'server/graphql/types/TeamMember'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const AddProviderPayload = new GraphQLObjectType({
  name: 'AddProviderPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    providerRow: {
      type: ProviderRow
    },
    provider: {
      type: Provider
    },
    joinedIntegrationIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      description: 'All the integrationIds that the provider has successfully joined'
    },
    teamMember: {
      type: TeamMember
    }
  })
})

export default AddProviderPayload
