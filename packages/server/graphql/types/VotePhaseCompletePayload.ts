import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveNewMeeting} from '../resolvers'
import RetrospectiveMeeting from './RetrospectiveMeeting'

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
