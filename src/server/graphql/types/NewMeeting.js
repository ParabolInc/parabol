import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import MeetingInvitee from 'server/graphql/types/MeetingInvitee';
import MeetingTask from 'server/graphql/types/MeetingTask';
import {resolveTeam} from 'server/graphql/resolvers';
import RetroThoughtGroup from 'server/graphql/types/RetroThoughtGroup';
import NewMeetingPhase from 'server/graphql/types/NewMeetingPhase';

const NewMeeting = new GraphQLObjectType({
  name: 'NewMeeting',
  description: 'A team meeting history for all previous meetings',
  fields: () => ({
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
    facilitatorId: {
      type: GraphQLID,
      description: 'The teamMemberId of the most recent facilitator'
    },
    invitees: {
      type: new GraphQLList(MeetingInvitee)
    },
    meetingNumber: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The auto-incrementing meeting number for the team'
    },
    tasksCreated: {
      type: new GraphQLList(MeetingTask),
      description: 'A list of immutable tasks, as they were created in the meeting'
    },
    RetroThoughtGroups: {
      type: new GraphQLList(RetroThoughtGroup)
    },
    phases: {
      type: new GraphQLList(NewMeetingPhase),
      description: 'The phases that make up the meeting'
    },
    summarySentAt: {
      type: GraphQLISO8601Type,
      description: 'The time the meeting summary was emailed to the team'
    },
    team: {
      description: 'The team that ran the meeting',
      resolve: resolveTeam
    }
  })
});

export default NewMeeting;
