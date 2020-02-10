import {GraphQLObjectType} from 'graphql'
import {resolveNewMeeting} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import NewMeeting from './NewMeeting'
import {GQLContext} from '../graphql'

const UpdateNewCheckInQuestionPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateNewCheckInQuestionPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    }
  })
})

export default UpdateNewCheckInQuestionPayload
