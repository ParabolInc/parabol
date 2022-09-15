import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {REFLECT} from 'parabol-client/utils/constants'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import {GQLContext} from '../graphql'
import {resolveNewMeeting} from '../resolvers'
import ReflectPhase from './ReflectPhase'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import StandardMutationError from './StandardMutationError'

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
