import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLBoolean,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLEnumType,
  GraphQLInputObjectType
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import TeamMember from '../TeamMember/teamMemberSchema';
import {AgendaItem} from '../AgendaItem/agendaItemSchema';
import {LOBBY, CHECKIN, UPDATES, FIRST_CALL, AGENDA_ITEMS, LAST_CALL, SUMMARY} from 'universal/utils/constants';

export const Phase = new GraphQLEnumType({
  name: 'Phase',
  description: 'The phase of the meeting',
  values: {
    [LOBBY]: {},
    [CHECKIN]: {},
    [UPDATES]: {},
    [FIRST_CALL]: {},
    [AGENDA_ITEMS]: {},
    [LAST_CALL]: {},
    [SUMMARY]: {}
  }
});

export const Team = new GraphQLObjectType({
  name: 'Team',
  description: 'A team',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team ID'},
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the team was created'
    },
    // isActive: {
    //   type: GraphQLBoolean,
    //   description: 'true if the team is active, false if it is in the archive'
    // },
    isPaid: {
      type: GraphQLBoolean,
      description: 'true if the underlying org has a validUntil date greater than now. if false, subs do not work'
    },
    meetingNumber: {
      type: GraphQLInt,
      description: 'The current or most recent meeting number (also the number of meetings the team has had'
    },
    name: {type: GraphQLString, description: 'The name of the team'},
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The organization to which the team belongs'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the team was last updated'
    },
    /* Ephemeral meeting state */
    checkInGreeting: {
      type: GraphQLString,
      description: 'The checkIn greeting (fun language)'
    },
    checkInQuestion: {
      type: GraphQLString,
      description: 'The checkIn question of the week'
    },
    meetingId: {
      type: GraphQLID,
      description: 'The unique Id of the active meeting'
    },
    activeFacilitator: {
      type: GraphQLID,
      description: 'The current facilitator teamMemberId for this meeting'
    },
    facilitatorPhase: {
      type: Phase,
      description: 'The phase of the facilitator'
    },
    facilitatorPhaseItem: {
      type: GraphQLInt,
      description: 'The current item number for the current phase for the facilitator, 1-indexed'
    },
    meetingPhase: {
      type: Phase,
      description: 'The phase of the meeting, usually matches the facilitator phase, be could be further along'
    },
    meetingPhaseItem: {
      type: GraphQLInt,
      description: 'The current item number for the current phase for the meeting, 1-indexed'
    },
    /* GraphQL sugar */
    agendaItems: {
      type: new GraphQLList(AgendaItem),
      description: 'The agenda items for the upcoming or current meeting',
      resolve({id}) {
        const r = getRethink();
        return r.table('AgendaItem')
          .getAll(id, {index: 'teamId'})
          .run();
      }
    },
    teamMembers: {
      type: new GraphQLList(TeamMember),
      description: 'All the team members associated who can join this team',
      resolve({id}) {
        const r = getRethink();
        return r.table('TeamMember')
          .getAll(id, {index: 'teamId'})
          .run();
      }
    },
    isArchived: {
      type: GraphQLBoolean,
      description: 'true if the team has been archived'
    }
  })
});

export const TeamInput = new GraphQLInputObjectType({
  name: 'TeamInput',
  fields: () => ({
    id: {type: GraphQLID, description: 'The unique team ID'},
    name: {type: GraphQLString, description: 'The name of the team'},
    orgId: {type: GraphQLID, description: 'The unique orginization ID that pays for the team'},
    isArchived: {type: GraphQLBoolean}
  })
});
