import {GraphQLEnumType} from 'graphql';
import {FAILED, PAID, PENDING, UPCOMING} from 'universal/utils/constants';

const InvoiceStatusEnum = new GraphQLEnumType({
  name: 'InvoiceStatusEnum',
  description: 'The payment status of the invoice',
  values: {
    [PENDING]: {},
    [PAID]: {},
    [FAILED]: {},
    [UPCOMING]: {}
  }
});

export default InvoiceStatusEnum;
