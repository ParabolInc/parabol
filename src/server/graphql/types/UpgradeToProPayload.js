import {GraphQLObjectType, GraphQLList} from 'graphql';
import Organization from 'server/graphql/types/Organization';
import {Team} from 'server/graphql/models/Team/teamSchema';

const UpgradeToProPayload = new GraphQLObjectType({
  name: 'UpgradeToProPayload',
  fields: () => ({
    organization: {
      type: Organization,
      description: 'The new Pro Org'
    },
    teams: {
      type: new GraphQLList(Team),
      description: 'The updated teams under the org'
    }
  })
});

export default UpgradeToProPayload;
