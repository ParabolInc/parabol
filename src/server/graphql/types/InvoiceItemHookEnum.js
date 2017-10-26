import {GraphQLEnumType} from 'graphql';
import {ADD_USER, AUTO_PAUSE_USER, PAUSE_USER, REMOVE_USER, UNPAUSE_USER} from 'server/utils/serverConstants';

const InvoiceItemHookEnum = new GraphQLEnumType({
  name: 'InvoiceItemHookEnum',
  description: 'The cause of the invoice item line being created',
  values: {
    [ADD_USER]: {},
    [AUTO_PAUSE_USER]: {},
    [REMOVE_USER]: {},
    [PAUSE_USER]: {},
    [UNPAUSE_USER]: {}
  }
});

export default InvoiceItemHookEnum;
