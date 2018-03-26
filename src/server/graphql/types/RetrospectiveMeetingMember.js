import {GraphQLInt, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import MeetingMember, {meetingMemberFields} from 'server/graphql/types/MeetingMember';

const RetrospectiveMeetingMember = new GraphQLObjectType({
  name: 'RetrospectiveMeetingMember',
  interfaces: () => [MeetingMember],
  description: 'All the meeting specifics for a user in a retro meeting',
  fields: () => ({
    ...meetingMemberFields(),
    votesRemaining: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  })
});

export default RetrospectiveMeetingMember;
