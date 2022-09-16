import {GraphQLObjectType} from 'graphql'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {GQLContext} from '../graphql'
import NewMeetingStage from './NewMeetingStage'
import StandardMutationError from './StandardMutationError'

const SetStageTimerPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'SetStageTimerPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    stage: {
      type: NewMeetingStage,
      description: 'The updated stage',
      resolve: async ({meetingId, stageId}, _args: unknown, {dataLoader}) => {
        if (!meetingId || !stageId) return null
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const stageRes = findStageById(meeting.phases, stageId)
        return stageRes!.stage
      }
    }
  })
})

export default SetStageTimerPayload
