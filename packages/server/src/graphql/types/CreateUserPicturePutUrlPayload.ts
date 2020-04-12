import {GraphQLObjectType} from 'graphql'
import GraphQLURLType from './GraphQLURLType'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const CreateUserPicturePutUrlPayload = new GraphQLObjectType<any, GQLContext>({
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
