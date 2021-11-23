import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveNewMeeting} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import ReflectPhase from './ReflectPhase'
import {REFLECT} from 'parabol-client/utils/constants'
import {GQLContext} from '../graphql'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'

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
      resolve: async (
        {meetingId}: {meetingId: string},
        _args: unknown,
        {dataLoader}: GQLContext
      ) => {
        const meeting = (await dataLoader
          .get('newMeetings')
          .load(meetingId)) as MeetingRetrospective
        return meeting.phases.find((phase) => phase.phaseType === REFLECT)
      }
    }
  })
})

export default SetPhaseFocusPayload
