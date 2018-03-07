import {GraphQLList, GraphQLObjectType} from 'graphql';
import Organization from 'server/graphql/types/Organization';
import {resolveOrganization, resolveTeams} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';

const UpdateCreditCardPayload = new GraphQLObjectType({
  name: 'UpdateCreditCardPayload',
  fields: () => ({
    organization: {
      type: Organization,
      description: 'The organization that received the updated credit card',
      resolve: resolveOrganization
    },
    teamsUpdated: {
      type: new GraphQLList(Team),
      description: 'The teams that are now paid up',
      resolve: resolveTeams
    }
  })
});

export default UpdateCreditCardPayload;
