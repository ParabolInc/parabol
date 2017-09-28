import {GraphQLEnumType} from 'graphql';
import {ADDED_USERS, INACTIVITY_ADJUSTMENTS, OTHER_ADJUSTMENTS, REMOVED_USERS} from 'universal/utils/constants';

const InvoiceLineItemEnum = new GraphQLEnumType({
  name: 'InvoiceLineItemEnum',
  description: 'A big picture line item',
  values: {
    [ADDED_USERS]: {},
    [INACTIVITY_ADJUSTMENTS]: {},
    [OTHER_ADJUSTMENTS]: {},
    [REMOVED_USERS]: {}
  }
});

export default InvoiceLineItemEnum;
