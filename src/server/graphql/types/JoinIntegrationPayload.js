import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import TeamMember from 'server/graphql/types/TeamMember';

const JoinIntegrationPayload = new GraphQLObjectType({
  name: 'JoinIntegrationPayload',
  fields: () => ({
    globalId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The globalId of the integration with a removed member'
    },
    teamMember: {
      type: new GraphQLNonNull(TeamMember)
    }
  })
});

export default JoinIntegrationPayload;
