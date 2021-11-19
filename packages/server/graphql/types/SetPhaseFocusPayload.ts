import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveNewMeeting} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import ReflectPhase from './ReflectPhase'
import {REFLECT} from 'parabol-client/utils/constants'
import {GQLContext} from '../graphql'
import GenericMeetingPhase from '../../database/types/GenericMeetingPhase'

const SetPhaseFocusPayload = new GraphQLObjectType<any, GQLContext>({
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
      resolve: async ({meetingId}, _args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        return meeting.phases.find((phase: GenericMeetingPhase) => phase.phaseType === REFLECT)
      }
    }
  })
})

export default SetPhaseFocusPayload
