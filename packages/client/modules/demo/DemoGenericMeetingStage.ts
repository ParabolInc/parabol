import {NewMeetingPhaseTypeEnum} from '../../__generated__/MeetingControlBar_meeting.graphql'
import {RetroDemo} from '../../types/constEnums'

export default class DemoGenericMeetingStage {
  __typename = 'GenericMeetingStage'
  __isNewMeetingStage = 'GenericMeetingStage'
  isViewerReady = false
  isAsync = false
  endAt = null
  meetingId = RetroDemo.MEETING_ID
  isComplete = false
  isNavigable = false
  isNavigableByFacilitator = false
  startAt = new Date().toJSON()
  viewCount = 0
  readyCount = 0
  scheduledEndTime = null
  suggestedEndTime = null
  suggestedTimeLimit = null
  teamId = RetroDemo.TEAM_ID
  timeRemaining = null
  phaseType: NewMeetingPhaseTypeEnum
  id: string

  constructor(id: string, phaseType: NewMeetingPhaseTypeEnum) {
    this.id = id
    this.phaseType = phaseType
  }
}
