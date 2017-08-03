import {GraphQLObjectType, GraphQLID} from 'graphql';
import ProviderRow from 'server/graphql/types/ProviderRow';
import {globalIdField} from 'graphql-relay';
import {GITHUB, SLACK} from 'universal/utils/constants';

const ProviderMap = new GraphQLObjectType({
  name: 'ProviderMap',
  description: 'A token for a user to be used on 1 or more teams',
  fields: () => ({
    id: globalIdField('ProviderMap', ({teamId}) => teamId),
    teamId: {
      type: GraphQLID
    },
    [SLACK]: {
      description: 'All the big details associated with slack',
      type: ProviderRow
    },
    [GITHUB]: {
      description: 'All the big details associated with GitHub',
      type: ProviderRow
    }
  })
});

export default ProviderMap;
