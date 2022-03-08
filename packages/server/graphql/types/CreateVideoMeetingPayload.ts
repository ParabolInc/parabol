import {GraphQLObjectType, GraphQLString} from 'graphql'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const CreateVideoMeetingPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'CreateVideoMeetingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    url: {
      type: GraphQLString,
    }
  })
})

export default CreateVideoMeetingPayload
