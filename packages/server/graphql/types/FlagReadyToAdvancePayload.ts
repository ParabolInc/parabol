import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveGQLStageFromId} from '../resolvers'
import NewMeeting from './NewMeeting'
import NewMeetingStage from './NewMeetingStage'
import makeMutationPayload from './makeMutationPayload'

export const FlagReadyToAdvanceSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'FlagReadyToAdvanceSuccess',
  fields: () => ({
    meeting: {
      type: new GraphQLNonNull(NewMeeting),
      description: 'the meeting with the updated readyCount',
      resolve: async ({meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    stage: {
      type: new GraphQLNonNull(NewMeetingStage),
      description: 'the stage with the updated readyCount',
      resolve: async ({meetingId, stageId}, _args: unknown, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
        return resolveGQLStageFromId(stageId, meeting)
      }
    }
  })
})

const FlagReadyToAdvancePayload = makeMutationPayload(
  'FlagReadyToAdvancePayload',
  FlagReadyToAdvanceSuccess
)

export default FlagReadyToAdvancePayload
