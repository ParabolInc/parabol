import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import NewMeeting from './NewMeeting'
import NewMeetingStage from './NewMeetingStage'

export const FlagReadyToAdvanceSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'FlagReadyToAdvanceSuccess',
  fields: () => ({
    meeting: {
      type: GraphQLNonNull(NewMeeting),
      description: 'the meeting with the updated readyCount',
      resolve: async ({meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    stage: {
      type: GraphQLNonNull(NewMeetingStage),
      description: 'the stage with the updated readyCount',
      resolve: async ({meetingId, stageId}, _args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {phases} = meeting
        const stageRes = findStageById(phases, stageId)!
        const {stage} = stageRes
        return stage
      }
    }
  })
})

const FlagReadyToAdvancePayload = makeMutationPayload(
  'FlagReadyToAdvancePayload',
  FlagReadyToAdvanceSuccess
)

export default FlagReadyToAdvancePayload
