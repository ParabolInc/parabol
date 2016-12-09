import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLList
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {nonnullifyInputThunk} from '../utils';
import {TRIAL_EXPIRES_SOON, ACCEPT_TO_ORG} from 'universal/modules/notifications/notificationList';

export const NotificationType = new GraphQLEnumType({
  name: 'NotificationType',
  description: 'The kind of notification',
  values: {
    [TRIAL_EXPIRES_SOON]: {value: TRIAL_EXPIRES_SOON},
    [ACCEPT_TO_ORG]: {value: ACCEPT_TO_ORG},
  }
});

// maybe just make notification a union of a bunch of things?
// export const NotificationVar = new GraphQLObjectType({
//   name: 'Notification',
//   description: 'A short-term project for a team member',
//   fields: () => ({
//
//   })
// })
export const Notification = new GraphQLObjectType({
  name: 'Notification',
  description: 'A short-term project for a team member',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique notification id (shortid)'},
    type: {
      type: new GraphQLNonNull(NotificationType),
      description: 'The type of notification this is. Text will be determined by the client'
    },
    varList: {
      type: new GraphQLList(GraphQLString)
    }
  })
});

const notificationInputThunk = () => ({
  id: {type: GraphQLID, description: 'The unique notification ID'},
  agendaId: {
    type: GraphQLID,
    description: 'the agenda item that created this project, if any'
  },
  content: {type: GraphQLString, description: 'The body of the notification. If null, it is a new notification.'},
  isComplete: {
    type: GraphQLBoolean,
    description: 'Marks the item as checked off'
  },
  sortOrder: {
    type: GraphQLFloat,
    description: 'the per-status sort order for the user dashboard'
  },
  teamMemberId: {type: GraphQLID, description: 'The team member ID of the person creating the notification (optional)'}
});

export const CreateActionInput = nonnullifyInputThunk('CreateActionInput', notificationInputThunk, ['id', 'teamMemberId']);
export const UpdateActionInput = nonnullifyInputThunk('UpdateActionInput', notificationInputThunk, ['id']);
