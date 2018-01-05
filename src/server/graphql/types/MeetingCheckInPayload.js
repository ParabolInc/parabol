import {GraphQLObjectType} from 'graphql';
import TeamMember from 'server/graphql/types/TeamMember';

const MeetingCheckInPayload = new GraphQLObjectType({
  name: 'MeetingCheckInPayload',
  fields: () => ({
    teamMember: {
      type: TeamMember
    }
  })
});

export default MeetingCheckInPayload;
