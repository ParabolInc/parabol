import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {makeResolve, resolveGQLStageFromId, resolveNewMeeting} from '../resolvers'
import NewMeeting from './NewMeeting'
import NewMeetingStage from './NewMeetingStage'
import StandardMutationError from './StandardMutationError'
import User from './User'

const PromoteNewMeetingFacilitatorPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'PromoteNewMeetingFacilitatorPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      description: 'The meeting in progress',
      resolve: resolveNewMeeting
    },
    facilitatorStage: {
      type: NewMeetingStage,
      resolve: async ({meetingId}, _args: unknown, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {facilitatorStageId} = meeting
        return resolveGQLStageFromId(facilitatorStageId, meeting)
      }
    },
    oldFacilitator: {
      type: User,
      description: 'The old meeting facilitator',
      resolve: makeResolve('oldFacilitatorUserId', 'oldFacilitator', 'users')
    }
  })
})

export default PromoteNewMeetingFacilitatorPayload
