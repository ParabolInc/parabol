import {GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import {GQLContext} from 'server/graphql/graphql'
import NewMeetingStage from 'server/graphql/types/NewMeetingStage'
import findStageById from 'universal/utils/meetings/findStageById'

const SetStageTimerPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'SetStageTimerPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    stage: {
      type: NewMeetingStage,
      description: 'The updated stage',
      resolve: async ({meetingId, stageId}, _args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const stageRes = findStageById(meeting.phases, stageId)
        return stageRes!.stage
      }
    }
  })
})

export default SetStageTimerPayload
