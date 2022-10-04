import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {GQLContext} from '../graphql'
import {resolveNewMeeting, resolveUnlockedStages} from '../resolvers'
import NewMeeting from './NewMeeting'
import NewMeetingStage from './NewMeetingStage'
import PhaseCompletePayload from './PhaseCompletePayload'
import StandardMutationError from './StandardMutationError'

const NavigateMeetingPayload = new GraphQLObjectType<any, GQLContext>({
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
      resolve: async ({meetingId, facilitatorStageId}, _args: unknown, {dataLoader}) => {
        if (!meetingId) return null
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const stageRes = findStageById(meeting.phases, facilitatorStageId)
        return stageRes && stageRes.stage
      }
    },
    oldFacilitatorStage: {
      type: NewMeetingStage,
      description: 'The stage that the facilitator left',
      resolve: async ({meetingId, oldFacilitatorStageId}, _args: unknown, {dataLoader}) => {
        if (!meetingId) return null
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
