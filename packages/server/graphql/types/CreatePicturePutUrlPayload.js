import {GraphQLObjectType} from 'graphql'
import GraphQLURLType from './GraphQLURLType'
import StandardMutationError from './StandardMutationError'

const CreatePicturePutUrlPayload = new GraphQLObjectType({
  name: 'CreatePicturePutUrlPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    url: {
      type: GraphQLURLType
    }
  })
})

export default CreatePicturePutUrlPayload
