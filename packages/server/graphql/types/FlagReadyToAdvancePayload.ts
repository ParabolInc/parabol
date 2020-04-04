import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import NewMeeting from './NewMeeting'
import GenericMeetingStage from './GenericMeetingStage'
import findStageById from 'parabol-client/utils/meetings/findStageById'

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
      type: GraphQLNonNull(GenericMeetingStage),
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
