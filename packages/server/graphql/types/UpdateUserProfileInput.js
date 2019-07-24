import {GraphQLInputObjectType, GraphQLString} from 'graphql'
import GraphQLURLType from './GraphQLURLType'

const UpdateUserProfileInput = new GraphQLInputObjectType({
  name: 'UpdateUserProfileInput',
  fields: () => ({
    picture: {
      type: GraphQLURLType,
      description: 'A link to the user’s profile image.'
    },
    preferredName: {
      type: GraphQLString,
      description: 'The name, as confirmed by the user'
    }
  })
})

export default UpdateUserProfileInput
