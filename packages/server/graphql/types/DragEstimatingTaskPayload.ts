import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import GenericMeetingStage from '../../database/types/GenericMeetingStage'
import getPhase from '../../utils/getPhase'
import {GQLContext} from '../graphql'
import {augmentDBStage} from '../resolvers'
import EstimateStage from './EstimateStage'
import PokerMeeting from './PokerMeeting'
import makeMutationPayload from './makeMutationPayload'

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
        const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
        const {phases, teamId} = meeting
        const phase = getPhase(phases, 'ESTIMATE')
        const {stages} = phase
        const dbStages = stages.filter((stage: GenericMeetingStage) => stageIds.includes(stage.id))
        return dbStages.map((dbStage: GenericMeetingStage) =>
          augmentDBStage(dbStage, meetingId, 'ESTIMATE', teamId)
        )
      }
    }
  })
})

const DragEstimatingTaskPayload = makeMutationPayload(
  'DragEstimatingTaskPayload',
  DragEstimatingTaskSuccess
)

export default DragEstimatingTaskPayload
