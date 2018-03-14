import {GraphQLObjectType} from 'graphql';
import {makeResolve} from 'server/graphql/resolvers';
import TeamMember from 'server/graphql/types/TeamMember';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const PromoteToTeamLeadPayload = new GraphQLObjectType({
  name: 'PromoteToTeamLeadPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    oldTeamLead: {
      type: TeamMember,
      resolve: makeResolve('oldTeamLeadId', 'oldTeamLead', 'teamMembers')
    },
    newTeamLead: {
      type: TeamMember,
      resolve: makeResolve('newTeamLeadId', 'newTeamLead', 'teamMembers')
    }
  })
});

export default PromoteToTeamLeadPayload;
