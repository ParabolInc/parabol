import {GraphQLID, GraphQLObjectType} from 'graphql'
import StandardMutationError from '../../types/StandardMutationError'
import {GQLContext} from '../../graphql'

const LoginSAMLPayload = new GraphQLObjectType<any, GQLContext>({
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
