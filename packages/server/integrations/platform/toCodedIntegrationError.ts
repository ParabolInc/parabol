import {GraphQLError} from 'graphql'

const toCodedIntegrationError = (error: Error) =>
  error instanceof GraphQLError
    ? error
    : new GraphQLError(error.message, {extensions: {code: 'SERVICE_UNAVAILABLE'}})

export default toCodedIntegrationError
