import {GraphQLObjectType, GraphQLString} from 'graphql'
import StandardMutationError from './StandardMutationError'

const CreateOAuth1AuthorizationURLPayload = new GraphQLObjectType({
  name: 'CreateOAuth1AuthorizationURLPayload',
  description: 'Authorization URL constructed after creating a new request token',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    url: {
      type: GraphQLString,
      description: 'Authorization URL including oauth_token to start authorization flow'
    }
  })
})

export default CreateOAuth1AuthorizationURLPayload
