import {GraphQLEnumType} from 'graphql'

const InvoiceStatusEnum = new GraphQLEnumType({
  name: 'InvoiceStatusEnum',
  description: 'The payment status of the invoice',
  values: {
    PENDING: {},
    PAID: {},
    FAILED: {},
    UPCOMING: {}
  }
})

export default InvoiceStatusEnum
