import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import ProviderRow from 'server/graphql/types/ProviderRow';
import Provider from 'server/graphql/types/Provider';

const AddProviderPayload = new GraphQLObjectType({
  name: 'AddProviderPayload',
  fields: () => ({
    providerRow: {
      type: new GraphQLNonNull(ProviderRow)
    },
    provider: {
      type: Provider
    }
  })
});

export default AddProviderPayload;
