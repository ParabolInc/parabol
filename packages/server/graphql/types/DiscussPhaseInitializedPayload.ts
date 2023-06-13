import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveNewMeeting} from '../resolvers'
import RetrospectiveMeeting from './RetrospectiveMeeting'

const DiscussPhaseInitializedPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'DiscussPhaseInitializedPayload',
  fields: () => ({
    meeting: {
      type: RetrospectiveMeeting,
      description: 'the current meeting',
      resolve: resolveNewMeeting
    }
  })
})

export default DiscussPhaseInitializedPayload
