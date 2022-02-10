import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import GenericMeetingPhase from '../../database/types/GenericMeetingPhase'
import GenericMeetingStage from '../../database/types/GenericMeetingStage'
import {GQLContext} from '../graphql'
import {augmentDBStage} from '../resolvers'
import EstimateStage from './EstimateStage'
import makeMutationPayload from './makeMutationPayload'
import PokerMeeting from './PokerMeeting'

export const DragEstimatingTaskSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'DragEstimatingTaskSuccess',
  fields: () => ({
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    meeting: {
      type: new GraphQLNonNull(PokerMeeting),
      resolve: ({meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    stageIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID)))
    },
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(EstimateStage))),
      resolve: async ({meetingId, stageIds}, _args: unknown, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {phases, teamId} = meeting
        const phase = phases.find((phase: GenericMeetingPhase) => phase.phaseType === 'ESTIMATE')!
        const {stages} = phase
        const dbStages = stages.filter((stage: GenericMeetingStage) => stageIds.includes(stage.id))
        dbStages.forEach((dbStage: GenericMeetingStage) =>
          augmentDBStage(dbStage, meetingId, 'ESTIMATE', teamId)
        )
        return dbStages
      }
    }
  })
})

const DragEstimatingTaskPayload = makeMutationPayload(
  'DragEstimatingTaskPayload',
  DragEstimatingTaskSuccess
)

export default DragEstimatingTaskPayload
