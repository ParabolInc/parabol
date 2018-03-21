import {GraphQLID, GraphQLInt, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import MeetingInvitee from 'server/graphql/types/MeetingInvitee';
import {makeResolve, resolveTeam} from 'server/graphql/resolvers';
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting';
import Team from 'server/graphql/types/Team';
import NewMeetingPhase from 'server/graphql/types/NewMeetingPhase';
import MeetingTypeEnum from 'server/graphql/types/MeetingTypeEnum';
import {RETROSPECTIVE} from 'universal/utils/constants';
import User from 'server/graphql/types/User';

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
  facilitatorStageId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The location of the facilitator in the meeting'
  },
  facilitatorUserId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The userId (or anonymousId) of the most recent facilitator'
  },
  facilitator: {
    type: new GraphQLNonNull(User),
    description: 'The facilitator user',
    resolve: makeResolve('facilitatorUserId', 'facilitator', 'users')
  },
  invitees: {
    type: new GraphQLList(MeetingInvitee)
  },
  meetingNumber: {
    type: new GraphQLNonNull(GraphQLInt),
    description: 'The auto-incrementing meeting number for the team'
  },
  meetingType: {
    type: new GraphQLNonNull(MeetingTypeEnum)
  },
  phases: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NewMeetingPhase))),
    description: 'The phases the meeting will go through, including all phase-specific state'
  },
  summarySentAt: {
    type: GraphQLISO8601Type,
    description: 'The time the meeting summary was emailed to the team'
  },
  team: {
    type: Team,
    description: 'The team that ran the meeting',
    resolve: resolveTeam
  },
  updatedAt: {
    type: GraphQLISO8601Type,
    description: 'The last time a meeting was updated (stage completed, finished, etc)'
  }
});

const NewMeeting = new GraphQLInterfaceType({
  name: 'NewMeeting',
  description: 'A team meeting history for all previous meetings',
  fields: newMeetingFields,
  resolveType: ({meetingType}) => {
    const resolveTypeLookup = {
      [RETROSPECTIVE]: RetrospectiveMeeting
    };
    return resolveTypeLookup[meetingType];
  }
});

export default NewMeeting;
