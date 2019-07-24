import {GraphQLObjectType} from 'graphql'
import GraphQLURLType from './GraphQLURLType'
import StandardMutationError from './StandardMutationError'

const CreateUserPicturePutUrlPayload = new GraphQLObjectType({
  name: 'CreateUserPicturePutUrlPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    url: {
      type: GraphQLURLType
    },
    pngUrl: {
      type: GraphQLURLType
    }
  })
})

export default CreateUserPicturePutUrlPayload
