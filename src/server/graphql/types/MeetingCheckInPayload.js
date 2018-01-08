import {GraphQLObjectType} from 'graphql';
import TeamMember from 'server/graphql/types/TeamMember';
import {resolveTeamMember} from 'server/graphql/resolvers';

const MeetingCheckInPayload = new GraphQLObjectType({
  name: 'MeetingCheckInPayload',
  fields: () => ({
    teamMember: {
      type: TeamMember,
      resolve: resolveTeamMember
    }
  })
});

export default MeetingCheckInPayload;
