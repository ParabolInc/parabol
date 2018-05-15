import {GraphQLObjectType} from 'graphql'
import GraphQLURLType from 'server/graphql/types/GraphQLURLType'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const CreateUserPicturePutUrlPayload = new GraphQLObjectType({
  name: 'CreateUserPicturePutUrlPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    url: {
      type: GraphQLURLType
    }
  })
})

export default CreateUserPicturePutUrlPayload
