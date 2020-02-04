import {GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import CheckInStage from './CheckInStage'
import MeetingGreeting from './MeetingGreeting'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'
import {ICheckInPhase} from '../../../client/types/graphql'
import {GQLContext} from '../graphql'

const CheckInPhase = new GraphQLObjectType<any, GQLContext>({
  name: 'CheckInPhase',
  description: 'The meeting phase where all team members check in one-by-one',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    checkInGreeting: {
      type: new GraphQLNonNull(MeetingGreeting),
      description: 'The checkIn greeting (fun language)'
    },
    checkInQuestion: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The checkIn question of the week (draft-js format)'
    },
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CheckInStage))),
      resolve: ({meetingId, phaseType, stages}: ICheckInPhase) => {
        return stages.map((stage) => ({
          ...stage,
          meetingId,
          phaseType
        }))
      }
    }
  })
})

export default CheckInPhase
