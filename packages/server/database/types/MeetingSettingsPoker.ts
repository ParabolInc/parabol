import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import MeetingSettings from './MeetingSettings'

interface Input {
  teamId: string
  id?: string
  maxVotesPerGroup?: number
  totalVotes?: number
  selectedTemplateId?: string
}

const phaseTypes = [
  NewMeetingPhaseTypeEnum.checkin,
  NewMeetingPhaseTypeEnum.SCOPE,
  NewMeetingPhaseTypeEnum.ESTIMATE
]

export default class MeetingSettingsPoker extends MeetingSettings {
  selectedTemplateId: string
  constructor(input: Input) {
    const {teamId, id, selectedTemplateId} = input
    super({teamId, id, meetingType: MeetingTypeEnum.poker, phaseTypes})
    this.selectedTemplateId = selectedTemplateId || 'estimatedEffortTemplate'
  }
}
