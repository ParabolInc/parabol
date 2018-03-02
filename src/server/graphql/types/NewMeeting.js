import {GraphQLID, GraphQLInt, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import MeetingInvitee from 'server/graphql/types/MeetingInvitee';
import {resolveTeam} from 'server/graphql/resolvers';
import NewMeetingStage from 'server/graphql/types/NewMeetingStage';
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting';
import Team from 'server/graphql/types/Team';

export const newMeetingFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The unique meeting id. shortid.'
  },
  createdAt: {
    type: GraphQLISO8601Type,
    description: 'The timestamp the meeting was created'
  },
  endedAt: {
    type: GraphQLISO8601Type,
    description: 'The timestamp the meeting officially ended'
  },
  facilitatorUserId: {
    type: GraphQLID,
    description: 'The userId (or anonymousId) of the most recent facilitator'
  },
  invitees: {
    type: new GraphQLList(MeetingInvitee)
  },
  meetingNumber: {
    type: new GraphQLNonNull(GraphQLInt),
    description: 'The auto-incrementing meeting number for the team'
  },
  stages: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NewMeetingStage))),
    description: 'The stages that make up the meeting'
  },
  summarySentAt: {
    type: GraphQLISO8601Type,
    description: 'The time the meeting summary was emailed to the team'
  },
  team: {
    type: Team,
    description: 'The team that ran the meeting',
    resolve: resolveTeam
  }
});

const NewMeeting = new GraphQLInterfaceType({
  name: 'NewMeeting',
  description: 'A team meeting history for all previous meetings',
  fields: newMeetingFields,
  resolveType: (value) => {
    if (value.retroThoughtGroups) {
      return RetrospectiveMeeting;
    }
    return undefined;
  }
});

export default NewMeeting;
