import {GraphQLID, GraphQLObjectType} from 'graphql'
import StandardMutationError from '../../types/StandardMutationError'

const LoginSAMLPayload = new GraphQLObjectType({
  name: 'LoginSAMLPayload',
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

export default LoginSAMLPayload
