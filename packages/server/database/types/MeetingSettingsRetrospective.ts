import {MeetingSettingsThreshold} from '../../../client/types/constEnums'
import {NewMeetingPhaseTypeEnum} from './GenericMeetingPhase'
import MeetingSettings from './MeetingSettings'

interface Input {
  teamId: string
  id?: string
  maxVotesPerGroup?: number
  totalVotes?: number
  selectedTemplateId?: string
  disableAnonymity?: boolean
  videoMeetingURL?: string
  recallBotId?: string
  addTeamHealth?: boolean
}

const phaseTypes = ['checkin', 'reflect', 'group', 'vote', 'discuss'] as NewMeetingPhaseTypeEnum[]

const teamHealthPhaseTypes = [
  'checkin',
  'TEAM_HEALTH',
  'reflect',
  'group',
  'vote',
  'discuss'
] as NewMeetingPhaseTypeEnum[]

export default class MeetingSettingsRetrospective extends MeetingSettings {
  maxVotesPerGroup: number
  totalVotes: number
  selectedTemplateId: string
  disableAnonymity: boolean
  videoMeetingURL?: string | null
  recallBotId?: string | null
  constructor(input: Input) {
    const {
      teamId,
      id,
      maxVotesPerGroup,
      selectedTemplateId,
      totalVotes,
      disableAnonymity,
      videoMeetingURL,
      recallBotId,
      addTeamHealth
    } = input
    const featurePhaseTypes = addTeamHealth ? teamHealthPhaseTypes : phaseTypes
    super({teamId, id, meetingType: 'retrospective', phaseTypes: featurePhaseTypes})
    this.maxVotesPerGroup =
      maxVotesPerGroup ?? MeetingSettingsThreshold.RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT
    this.totalVotes = totalVotes ?? MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_DEFAULT
    this.selectedTemplateId = selectedTemplateId || 'workingStuckTemplate'
    this.disableAnonymity = disableAnonymity ?? false
    this.videoMeetingURL = videoMeetingURL
    this.recallBotId = recallBotId
  }
}
