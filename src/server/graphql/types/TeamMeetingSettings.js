import {GraphQLInt, GraphQLList, GraphQLObjectType} from 'graphql';
import NewMeetingPhaseTypeEnum from 'server/graphql/types/NewMeetingPhaseTypeEnum';

const TeamMeetingSettings = new GraphQLObjectType({
  name: 'TeamMeetingSettings',
  description: 'The team settings for a specific type of meeting',
  fields: () => ({
    availableMeetings: {
      type: GraphQLInt,
      description: 'Meetings available (if not pro)'
    },
    phases: {
      description: 'The broad phase types that will be addressed during the meeting',
      type: new GraphQLList(NewMeetingPhaseTypeEnum)
    }
  })
});

export default TeamMeetingSettings;
