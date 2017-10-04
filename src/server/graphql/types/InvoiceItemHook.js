import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import InvoiceItemHookEnum from 'server/graphql/types/InvoiceItemHookEnum';

const InvoiceItemHook = new GraphQLObjectType({
  name: 'InvoiceItemHook',
  description: 'A hook to link the subscription update to the correlating invoice items that stripe will make',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'shortid'},
    type: {
      type: InvoiceItemHookEnum,
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

export default InvoiceItemHook;
