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
import {TRIAL_EXPIRES_SOON, ACCEPT_NEW_USER} from 'universal/utils/constants';

export const NotificationType = new GraphQLEnumType({
  name: 'NotificationType',
  description: 'The kind of notification',
  values: {
    [TRIAL_EXPIRES_SOON]: {value: TRIAL_EXPIRES_SOON},
    [ACCEPT_NEW_USER]: {value: ACCEPT_NEW_USER},
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
    endAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime to deactivate the notification & stop sending it to the client'
    },
    orgId: {
      type: GraphQLID,
      description: '*The unique organization ID for this notification. Can be blank for targeted notifications'
    },
    parentId: {
      type: GraphQLID,
      description: '*Unique for the notification content. Not unique if the notification applies to multiple users'
    },
    startAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime to activate the notification & send it to the client'
    },
    type: {
      type: new GraphQLNonNull(NotificationType),
      description: 'The type of notification this is. Text will be determined by the client'
    },
    userId: {
      type: GraphQLID,
      description: '*The userId that should see this notification'
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
