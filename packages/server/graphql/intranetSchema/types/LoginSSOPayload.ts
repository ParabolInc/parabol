import {GraphQLID, GraphQLObjectType} from 'graphql'
import StandardMutationError from '../../types/StandardMutationError'

const LoginSSOPayload = new GraphQLObjectType({
  name: 'LoginSSOPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    authToken: {
      type: GraphQLID,
      description: 'The new JWT'
    }
  })
})

export default LoginSSOPayload
