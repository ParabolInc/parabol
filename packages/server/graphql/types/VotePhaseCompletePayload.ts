import {GraphQLObjectType} from 'graphql'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import {resolveNewMeeting} from '../resolvers'
import {GQLContext} from '../graphql'

const VotePhaseCompletePayload = new GraphQLObjectType<any, GQLContext>({
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
