import {GraphQLObjectType} from 'graphql';
import TeamMember from 'server/graphql/types/TeamMember';
import {resolveTeamMember} from 'server/graphql/resolvers';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const MeetingCheckInPayload = new GraphQLObjectType({
  name: 'MeetingCheckInPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    teamMember: {
      type: TeamMember,
      resolve: resolveTeamMember
    }
  })
});

export default MeetingCheckInPayload;
