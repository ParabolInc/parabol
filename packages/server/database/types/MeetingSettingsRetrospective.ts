import MeetingSettings from './MeetingSettings'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import {MeetingSettingsDefaults} from 'parabol-client/types/constEnums'

interface Input {
  teamId: string
  id?: string
  maxVotesPerGroup?: number
  totalVotes?: number
  selectedTemplateId: string
}

const phaseTypes = [
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
      maxVotesPerGroup ?? MeetingSettingsDefaults.RETROSPECTIVE_MAX_VOTES_PER_GROUP
    this.totalVotes = totalVotes ?? MeetingSettingsDefaults.RETROSPECTIVE_TOTAL_VOTES
    this.selectedTemplateId = selectedTemplateId
  }
}
