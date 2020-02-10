import {GraphQLObjectType} from 'graphql'
import GraphQLURLType from './GraphQLURLType'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const CreatePicturePutUrlPayload = new GraphQLObjectType<any, GQLContext>({
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
