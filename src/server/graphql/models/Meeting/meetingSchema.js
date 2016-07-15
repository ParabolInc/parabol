import r from '../../../database/rethinkDriver';
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {TeamMember, CreateTeamMemberInput} from '../TeamMember/teamMemberSchema';
import {nonnullifyInputThunk} from '../utils';

export const SOUNDOFF = 'SOUNDOFF';
export const PRESENT = 'PRESENT';

export const Meeting = new GraphQLObjectType({
  name: 'Meeting',
  description: 'A meeting',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique meeting ID'},
    name: {type: GraphQLString, description: 'The name of the meeting'},
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the meeting was created'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the meeting was last updated'
    },
    teamMembers: {
      type: new GraphQLList(TeamMember),
      description: 'All the team members associated who can join this meeting',
      async resolve({id}) {
        return await r.table('TeamMember').getAll(id, {index: 'meetingId'});
      }
    }
  })
});

const meetingInputThunk = () => ({
  id: {type: GraphQLID, description: 'The unique meeting ID'},
  name: {type: GraphQLString, description: 'The name of the meeting'},
  leader: {
    type: CreateTeamMemberInput,
    description: 'Each meeting must be created with 1 meeting member, the leader.'
  }
});

export const CreateMeetingInput = nonnullifyInputThunk('CreateMeetingInput', meetingInputThunk, ['id', 'name']);
export const UpdateMeetingInput = nonnullifyInputThunk('UpdateMeetingInput', meetingInputThunk, ['id']);
