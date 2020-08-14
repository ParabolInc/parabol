import {MeetingSettingsThreshold} from 'parabol-client/types/constEnums'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import MeetingSettings from './MeetingSettings'

interface Input {
  teamId: string
  id?: string
  maxVotesPerGroup?: number
  totalVotes?: number
  selectedTemplateId?: string
  managedTemplateIds?: string[]
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
  managedTemplateIds: string[]
  constructor(input: Input) {
    const {teamId, id, maxVotesPerGroup, selectedTemplateId, managedTemplateIds, totalVotes} = input
    super({teamId, id, meetingType: MeetingTypeEnum.retrospective, phaseTypes})
    this.maxVotesPerGroup =
      maxVotesPerGroup ?? MeetingSettingsThreshold.RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT
    this.totalVotes = totalVotes ?? MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_DEFAULT
    this.managedTemplateIds = managedTemplateIds || [
      'sailboatTemplate',
      'startStopContinueTemplate',
      'workingStuckTemplate',
      'fourLsTemplate',
      'gladSadMadTemplate'
    ]
    this.selectedTemplateId = selectedTemplateId || 'workingStuckTemplate'
  }
}
