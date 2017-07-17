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
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId of the person who removed the provider'
    }
  })
});

export default RemoveProviderPayload;
