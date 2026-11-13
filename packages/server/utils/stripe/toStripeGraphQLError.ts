import {GraphQLError} from 'graphql'

const USER_FIXABLE_STRIPE_ERROR_TYPES = ['StripeCardError', 'StripeInvalidRequestError']

const toStripeGraphQLError = (error: Error) => {
  const isUserFixable =
    'type' in error && USER_FIXABLE_STRIPE_ERROR_TYPES.includes(String(error.type))
  return new GraphQLError(error.message, {
    extensions: {code: isUserFixable ? 'BAD_USER_INPUT' : 'SERVICE_UNAVAILABLE'}
  })
}

export default toStripeGraphQLError
