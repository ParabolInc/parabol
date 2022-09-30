import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveNewMeeting} from '../resolvers'
import NewMeeting from './NewMeeting'
import StandardMutationError from './StandardMutationError'

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
