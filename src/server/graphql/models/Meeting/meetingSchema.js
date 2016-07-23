import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';

const Phase = new GraphQLEnumType({
  name: 'Phase',
  description: 'The phase of the meeting',
  values: {
    CHECKIN: {value: 'CHECKIN'},
    UPDATES: {value: 'UPDATES'},
    REQUESTS: {value: 'REQUESTS'},
  }
});
export const Meeting = new GraphQLObjectType({
  name: 'Meeting',
  description: 'A team meeting history for all current and previous meetings',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique meeting id'},
    meetingNumber: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The auto-incrementing meeting number for the team'
    },
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team associated with this meeting'},
    isActive: {type: GraphQLBoolean, description: 'true if a meeting is currently in progress'},
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting was created'
    },
    endedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting officially ended'
    },
    checkinOrder: {
      type: new GraphQLList(GraphQLID),
      description: 'A randomly generated array of team members\' userIds'
    },
    activeFacilitator: {
      type: GraphQLID,
      description: 'The current facilitator for this meeting'
    },
    facilitatorPhase: {
      type: Phase,
      description: 'The phase of the facilitator'
    },
    facilitatorPhaseItem: {
      type: GraphQLInt,
      description: 'The current item number for the current phase for the facilitator'
    },
    meetingPhase: {
      type: Phase,
      description: 'The phase of the meeting, usually matches the facilitator phase, be could be further along'
    },
    meetingPhaseItem: {
      type: GraphQLInt,
      description: 'The current item number for the current phase for the meeting'
    }

  })
});
