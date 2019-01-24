import {GraphQLInputObjectType, GraphQLString} from 'graphql'
import UploadMeta from 'server/graphql/types/UploadMeta'

const UpdateUserProfileInput = new GraphQLInputObjectType({
  name: 'UpdateUserProfileInput',
  fields: () => ({
    picture: {
      type: UploadMeta,
      description: 'an uploaded image'
    },
    preferredName: {
      type: GraphQLString,
      description: 'The name, as confirmed by the user'
    }
  })
})

export default UpdateUserProfileInput
