import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import makeMutationPayload from './makeMutationPayload'
import {GQLContext} from '../graphql'

const EmailPasswordResetSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'EmailPasswordResetSuccess',
  fields: () => ({
    // success: {
    //   type: GraphQLBoolean
    // }
  })
})

const EmailPasswordResetPayload = makeMutationPayload(
  'EmailPasswordResetPayload',
  EmailPasswordResetSuccess
)

export default EmailPasswordResetPayload
