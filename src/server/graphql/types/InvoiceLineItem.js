import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import InvoiceLineItemEnum from 'server/graphql/types/InvoiceLineItemEnum';
import InvoiceLineItemDetails from 'server/graphql/types/InvoiceLineItemDetails';


const InvoiceLineItem = new GraphQLObjectType({
  name: 'InvoiceLineItem',
  description: 'A single line item charge on the invoice',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique line item id'},
    amount: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The amount for the line item (in USD)'
    },
    description: {
      type: GraphQLString,
      description: 'A description of the charge. Only present if we have no idea what the charge is'
    },
    details: {
      type: new GraphQLList(new GraphQLNonNull(InvoiceLineItemDetails)),
      description: 'Array of user activity line items that roll up to total activity (add/leave/pause/unpause)'
    },
    quantity: {
      type: GraphQLInt,
      description: 'The total number of days that all org users have been inactive during the billing cycle'
    },
    type: {
      type: InvoiceLineItemEnum,
      description: 'The line item type for a monthly billing invoice'
    }
  })
});

export default InvoiceLineItem;
