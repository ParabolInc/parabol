import {GraphQLBoolean, GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting';
import MeetingTypeEnum from 'server/graphql/types/MeetingTypeEnum';
import {RETROSPECTIVE} from 'universal/utils/constants';

export const meetingMemberFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'A composite of userId::meetingId'
  },
  isCheckedIn: {
    type: GraphQLBoolean,
    description: 'true if present, false if absent, else null'
  },
  meetingId: {
    type: GraphQLID
  },
  meetingType: {
    type: new GraphQLNonNull(MeetingTypeEnum)
  },
  teamId: {
    type: GraphQLID
  },
  userId: {
    type: GraphQLID
  },
  updatedAt: {
    type: GraphQLISO8601Type,
    description: 'The last time a meeting was updated (stage completed, finished, etc)'
  }
});

const resolveTypeLookup = {
  [RETROSPECTIVE]: RetrospectiveMeeting
};

const MeetingMember = new GraphQLInterfaceType({
  name: 'MeetingMember',
  description: 'All the user details for a specific meeting',
  fields: meetingMemberFields,
  resolveType: ({meetingType}) => resolveTypeLookup[meetingType]
});

export default MeetingMember;
