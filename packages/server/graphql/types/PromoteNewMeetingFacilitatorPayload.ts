import {GraphQLObjectType} from 'graphql'
import {makeResolve, resolveNewMeeting} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import NewMeeting from 'server/graphql/types/NewMeeting'
import User from 'server/graphql/types/User'

const PromoteNewMeetingFacilitatorPayload = new GraphQLObjectType({
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
    oldFacilitator: {
      type: User,
      description: 'The old meeting facilitator',
      resolve: makeResolve('oldFacilitatorUserId', 'oldFacilitator', 'users')
    }
  })
})

export default PromoteNewMeetingFacilitatorPayload
