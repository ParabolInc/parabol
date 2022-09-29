import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveNewMeeting} from '../resolvers'
import NewMeeting from './NewMeeting'
import StandardMutationError from './StandardMutationError'

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
