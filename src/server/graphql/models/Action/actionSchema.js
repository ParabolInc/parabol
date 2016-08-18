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
    content: {type: GraphQLString, description: 'The body of the action. If null, it is a new action.'},
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the user (first part of teamMemberId). Stored so action items are a single subscription'
    },
    isComplete: {
      type: GraphQLBoolean,
      description: 'Marks the item as checked off'
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'Shows the item in subscriptions'
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the action was created'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the action was updated'
    },
    sortOrder: {
      type: GraphQLFloat,
      description: 'the per-status sort order for the user dashboard'
    }
  })
});

const actionInputThunk = () => ({
  id: {type: GraphQLID, description: 'The unique action ID'},
  content: {type: GraphQLString, description: 'The body of the action. If null, it is a new action.'},
  sortOrder: {
    type: GraphQLFloat,
    description: 'the per-status sort order for the user dashboard'
  }
});

export const CreateActionInput = nonnullifyInputThunk('CreateActionInput', actionInputThunk, ['id']);
export const UpdateActionInput = nonnullifyInputThunk('UpdateActionInput', actionInputThunk, ['id']);
