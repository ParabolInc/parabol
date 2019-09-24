import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'

const PayLaterPayload = new GraphQLObjectType({
  name: 'PayLaterPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    }
  })
})

export default PayLaterPayload
