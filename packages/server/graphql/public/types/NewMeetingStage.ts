import isValidDate from '../../../../client/utils/isValidDate'
import type GenericMeetingStage from '../../../database/types/GenericMeetingStage'
import {getUserId} from '../../../utils/authorization'
import type {NewMeetingPhaseTypeEnum, NewMeetingStageResolvers} from '../resolverTypes'

export interface NewMeetingStageSource extends GenericMeetingStage {
  meetingId: string
  teamId: string
  phaseType: NewMeetingPhaseTypeEnum
}

const NewMeetingStage: NewMeetingStageResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) =>
    dataLoader.get('newMeetings').loadNonNull(meetingId),

  phase: async ({meetingId, phaseType, teamId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const {phases} = meeting
    const phase = phases.find((phase) => phase.phaseType === phaseType)!
    return {...phase, meetingId, teamId}
  },

  isViewerReady: ({readyToAdvance}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return readyToAdvance?.includes(viewerId) ?? false
  },

  readyUserIds: async ({readyToAdvance}, _args) => {
    return readyToAdvance ?? []
  },

  timeRemaining: ({scheduledEndTime}) => {
    if (!scheduledEndTime) return null
    const coercedDate = new Date(scheduledEndTime)
    if (!isValidDate(coercedDate)) return null
    return coercedDate.getTime() - Date.now()
  },

  stageIdx: async ({id: stageId, meetingId, phaseType}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const phase = meeting.phases.find((p) => p.phaseType === phaseType)
    if (!phase) return 0
    return phase.stages.findIndex((stage) => stage.id === stageId)
  }
}

export default NewMeetingStage
