import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';

const InvoiceLineItemDetails = new GraphQLObjectType({
  name: 'InvoiceLineItemDetails',
  description: 'The per-user-action line item details,',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique detailed line item id'},
    amount: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The amount for the line item (in USD)'
    },
    email: {
      type: GraphQLEmailType,
      description: 'The email affected by this line item change'
    },
    endAt: {
      type: GraphQLISO8601Type,
      description: 'End of the event. Only present if a pause action gets matched up with an unpause action'
    },
    parentId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The parent line item id'
    },
    startAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp for the beginning of the period of no charge'
    }
  })
});

export default InvoiceLineItemDetails;
