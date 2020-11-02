import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import EstimateStage from './EstimateStage'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

export const PokerAnnounceDeckHoverSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerAnnounceDeckHoverSuccess',
  fields: () => ({
    stage: {
      type: GraphQLNonNull(EstimateStage),
      description: 'The stage that holds the updated scores',
      resolve: async ({meetingId, stageId}, _args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {phases} = meeting
        const estimatePhase = phases.find(
          (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.ESTIMATE
        )!
        const {stages} = estimatePhase
        const estimateStage = stages.find((stage) => stage.id === stageId)!
        return estimateStage
      }
    }
  })
})

const PokerAnnounceDeckHoverPayload = makeMutationPayload(
  'PokerAnnounceDeckHoverPayload',
  PokerAnnounceDeckHoverSuccess
)

export default PokerAnnounceDeckHoverPayload
