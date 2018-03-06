import {GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import NewMeetingPhaseTypeEnum from 'server/graphql/types/NewMeetingPhaseTypeEnum';
import Team from 'server/graphql/types/Team';
import {resolveTeam} from 'server/graphql/resolvers';
import MeetingTypeEnum from 'server/graphql/types/MeetingTypeEnum';

const TeamMeetingSettings = new GraphQLObjectType({
  name: 'TeamMeetingSettings',
  description: 'The team settings for a specific type of meeting',
  fields: () => ({
    meetingsOffered: {
      type: GraphQLInt,
      description: 'The total number of meetings given to the team'
    },
    meetingsRemaining: {
      type: GraphQLInt,
      description: 'Number of meetings that can be run (if not pro)'
    },
    meetingType: {
      description: 'The type of meeting these settings apply to',
      type: MeetingTypeEnum
    },
    phases: {
      description: 'The broad phase types that will be addressed during the meeting',
      type: new GraphQLNonNull(new GraphQLList(NewMeetingPhaseTypeEnum))
    },
    team: {
      description: 'The team these settings belong to',
      type: Team,
      resolve: resolveTeam
    }
  })
});

export default TeamMeetingSettings;
