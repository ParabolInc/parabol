import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLList} from 'graphql';
import ProviderRow from 'server/graphql/types/ProviderRow';
import Provider from 'server/graphql/types/Provider';
import TeamMember from 'server/graphql/types/TeamMember';

const AddProviderPayload = new GraphQLObjectType({
  name: 'AddProviderPayload',
  fields: () => ({
    providerRow: {
      type: new GraphQLNonNull(ProviderRow)
    },
    provider: {
      type: Provider
    },
    joinedIntegrationIds: {
      type: new GraphQLList(GraphQLID),
      description: 'All the integrationIds that the provider has successfully joined'
    },
    teamMember: {
      type: TeamMember
    }
  })
});

export default AddProviderPayload;
