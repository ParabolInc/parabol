import {GraphQLObjectType, GraphQLList, GraphQLNonNull} from 'graphql'
import NewMeeting from 'server/graphql/types/NewMeeting'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import {resolveNewMeeting, resolveUnlockedStages} from 'server/graphql/resolvers'
import findStageById from 'universal/utils/meetings/findStageById'
import NewMeetingStage from 'server/graphql/types/NewMeetingStage'
import PhaseCompletePayload from 'server/graphql/types/PhaseCompletePayload'

const NavigateMeetingPayload = new GraphQLObjectType({
  name: 'NavigateMeetingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    facilitatorStage: {
      type: NewMeetingStage,
      description: 'The stage that the facilitator is now on',
      resolve: async ({meetingId, facilitatorStageId}, args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const stageRes = findStageById(meeting.phases, facilitatorStageId)
        return stageRes && stageRes.stage
      }
    },
    oldFacilitatorStage: {
      type: NewMeetingStage,
      description: 'The stage that the facilitator left',
      resolve: async ({meetingId, oldFacilitatorStageId}, args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const stageRes = findStageById(meeting.phases, oldFacilitatorStageId)
        return stageRes && stageRes.stage
      }
    },
    phaseComplete: {
      type: PhaseCompletePayload,
      description: 'Additional details triggered by completing certain phases',
      resolve: (source) => source
    },
    unlockedStages: {
      type: new GraphQLList(new GraphQLNonNull(NewMeetingStage)),
      description: 'The stages that were unlocked by navigating',
      resolve: resolveUnlockedStages
    }
  })
})

export default NavigateMeetingPayload
