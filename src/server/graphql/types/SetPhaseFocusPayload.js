import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveNewMeeting} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting'
import ReflectPhase from 'server/graphql/types/ReflectPhase'
import {REFLECT} from 'universal/utils/constants'

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
