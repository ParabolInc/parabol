import {MeetingSettingsThreshold} from 'parabol-client/types/constEnums'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import MeetingSettings from './MeetingSettings'

interface Input {
  teamId: string
  id?: string
  maxVotesPerGroup?: number
  totalVotes?: number
  selectedTemplateId?: string
}

export const phaseTypes = [
  NewMeetingPhaseTypeEnum.checkin,
  NewMeetingPhaseTypeEnum.reflect,
  NewMeetingPhaseTypeEnum.group,
  NewMeetingPhaseTypeEnum.vote,
  NewMeetingPhaseTypeEnum.discuss
]

export default class MeetingSettingsRetrospective extends MeetingSettings {
  maxVotesPerGroup: number
  totalVotes: number
  selectedTemplateId: string
  constructor(input: Input) {
    const {teamId, id, maxVotesPerGroup, selectedTemplateId, totalVotes} = input
    super({teamId, id, meetingType: MeetingTypeEnum.retrospective, phaseTypes})
    this.maxVotesPerGroup =
      maxVotesPerGroup ?? MeetingSettingsThreshold.RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT
    this.totalVotes = totalVotes ?? MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_DEFAULT
    this.selectedTemplateId = selectedTemplateId || 'workingStuckTemplate'
  }
}
