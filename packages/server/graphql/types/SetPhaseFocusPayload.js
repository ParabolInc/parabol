import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveNewMeeting} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import ReflectPhase from './ReflectPhase'
import {REFLECT} from '../../../client/utils/constants'

const SetPhaseFocusPayload = new GraphQLObjectType({
  name: 'SetPhaseFocusPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: new GraphQLNonNull(RetrospectiveMeeting),
      resolve: resolveNewMeeting
    },
    reflectPhase: {
      type: new GraphQLNonNull(ReflectPhase),
      resolve: async ({meetingId}, args, {authToken, dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        return meeting.phases.find((phase) => phase.phaseType === REFLECT)
      }
    }
  })
})

export default SetPhaseFocusPayload
