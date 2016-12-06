import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {nonnullifyInputThunk} from '../utils';

export const Action = new GraphQLObjectType({
  name: 'Action',
  description: 'A short-term project for a team member',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique action id, teamId::shortid'},
    agendaId: {
      type: GraphQLID,
      description: 'the agenda item that created this project, if any (indexed)'
    },
    content: {type: GraphQLString, description: 'The body of the action. If null, it is a new action.'},
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the action was created'
    },
    createdBy: {
      type: GraphQLID,
      description: 'The userId that created the action'
    },
    isComplete: {
      type: GraphQLBoolean,
      description: 'Marks the item as checked off'
    },
    sortOrder: {
      type: GraphQLFloat,
      description: 'the per-status sort order for the user dashboard'
    },
    teamMemberId: {type: GraphQLID, description: 'The team member ID of the person creating the action (optional)'},
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the action was updated'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the user (first part of teamMemberId). Stored so action items are a single subscription'
    }
  })
});

const actionInputThunk = () => ({
  id: {type: GraphQLID, description: 'The unique action ID'},
  agendaId: {
    type: GraphQLID,
    description: 'the agenda item that created this project, if any'
  },
  content: {type: GraphQLString, description: 'The body of the action. If null, it is a new action.'},
  isComplete: {
    type: GraphQLBoolean,
    description: 'Marks the item as checked off'
  },
  sortOrder: {
    type: GraphQLFloat,
    description: 'the per-status sort order for the user dashboard'
  },
  teamMemberId: {type: GraphQLID, description: 'The team member ID of the person creating the action (optional)'}
});

export const CreateActionInput = nonnullifyInputThunk('CreateActionInput', actionInputThunk, ['id', 'teamMemberId']);
export const UpdateActionInput = nonnullifyInputThunk('UpdateActionInput', actionInputThunk, ['id']);
