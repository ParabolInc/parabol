import {GraphQLObjectType, GraphQLList} from 'graphql';
import {resolveOrganization, resolveTeams} from 'server/graphql/resolvers';
import Organization from 'server/graphql/types/Organization';
import Team from 'server/graphql/types/Team';

const UpgradeToProPayload = new GraphQLObjectType({
  name: 'UpgradeToProPayload',
  fields: () => ({
    organization: {
      type: Organization,
      description: 'The new Pro Org',
      resolve: resolveOrganization
    },
    teams: {
      type: new GraphQLList(Team),
      description: 'The updated teams under the org',
      resolve: resolveTeams
    }
  })
});

export default UpgradeToProPayload;
