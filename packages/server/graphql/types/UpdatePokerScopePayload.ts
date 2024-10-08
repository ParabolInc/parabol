import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import getPhase from '../../utils/getPhase'
import {GQLContext} from '../graphql'
import {resolveGQLStagesFromPhase} from '../resolvers'
import EstimateStage from './EstimateStage'
import PokerMeeting from './PokerMeeting'
import makeMutationPayload from './makeMutationPayload'

export const UpdatePokerScopeSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdatePokerScopeSuccess',
  fields: () => ({
    meeting: {
      type: new GraphQLNonNull(PokerMeeting),
      description: 'The meeting with the updated estimate phases',
      resolve: ({meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('newMeetings').loadNonNull(meetingId)
      }
    },
    newStages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(EstimateStage))),
      description: 'The estimate stages added to the meeting',
      resolve: async ({meetingId, newStageIds}, _args: unknown, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
        const {phases, teamId} = meeting
        const phase = getPhase(phases, 'ESTIMATE')
        const {stages} = phase
        const dbNewStages = stages.filter((stage) => newStageIds.includes(stage.id))
        return resolveGQLStagesFromPhase({
          meetingId,
          phaseType: 'ESTIMATE',
          stages: dbNewStages,
          teamId
        })
      }
    }
  })
})

const UpdatePokerScopePayload = makeMutationPayload(
  'UpdatePokerScopePayload',
  UpdatePokerScopeSuccess
)

export default UpdatePokerScopePayload
