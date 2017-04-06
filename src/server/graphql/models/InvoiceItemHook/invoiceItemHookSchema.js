import {
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLFloat,
} from 'graphql';
import {
  ADD_USER,
  AUTO_PAUSE_USER,
  REMOVE_USER,
  PAUSE_USER,
  UNPAUSE_USER
} from 'server/utils/serverConstants';

export const HookType = new GraphQLEnumType({
  name: 'HookType',
  description: 'The cause of the invoice item line being created',
  values: {
    [ADD_USER]: {},
    [AUTO_PAUSE_USER]: {},
    [REMOVE_USER]: {},
    [PAUSE_USER]: {},
    [UNPAUSE_USER]: {}
  }
});

export const InvoiceItemHook = new GraphQLObjectType({
  name: 'InvoiceItemHook',
  description: 'A hook to link the subscription update to the correlating invoice items that stripe will make',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'shortid'},
    type: {
      type: HookType,
      description: 'The reason for the subscription quantity update'
    },
    prorationDate: {
      type: GraphQLFloat,
      description: '*Timestamp with 1-second resolution.'
    },
    stripeSubscriptionId: {
      type: GraphQLID,
      description: 'The stripeSubscriptionId from the org that is associated with the change'
    },
    userId: {
      type: GraphQLID,
      description: 'The user that was added/removed/paused/unpaused'
    }
  })
});
