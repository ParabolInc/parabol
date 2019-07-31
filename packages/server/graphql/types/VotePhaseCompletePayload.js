import {GraphQLObjectType} from 'graphql'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import {resolveNewMeeting} from '../resolvers'

const VotePhaseCompletePayload = new GraphQLObjectType({
  name: 'VotePhaseCompletePayload',
  fields: () => ({
    meeting: {
      type: RetrospectiveMeeting,
      description: 'the current meeting',
      resolve: resolveNewMeeting
    }
  })
})

export default VotePhaseCompletePayload
