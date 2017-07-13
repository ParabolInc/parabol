import {GraphQLNonNull, GraphQLObjectType, GraphQLList, GraphQLID} from 'graphql';
import ProviderRow from 'server/graphql/types/ProviderRow';

const RemoveProviderPayload = new GraphQLObjectType({
  name: 'RemoveProviderPayload',
  fields: () => ({
    providerRow: {
      type: new GraphQLNonNull(ProviderRow)
    },
    deletedIntegrationIds: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLID))
    }
  })
});

export default RemoveProviderPayload;
