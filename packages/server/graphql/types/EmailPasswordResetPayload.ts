import {GraphQLBoolean, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

const EmailPasswordResetSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'EmailPasswordResetSuccess',
  fields: () => ({
    success: {
      type: GraphQLBoolean,
      description: 'True if the email password reset was successfully sent'
    }
  })
})

const EmailPasswordResetPayload = makeMutationPayload(
  'EmailPasswordResetPayload',
  EmailPasswordResetSuccess
)

export default EmailPasswordResetPayload
