import {GraphQLObjectType} from 'graphql'
import NewMeeting from './NewMeeting'
import {resolveNewMeeting} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const ResetRetroMeetingToGroupStagePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'ResetRetroMeetingToGroupStagePayload',
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

export default ResetRetroMeetingToGroupStagePayload
