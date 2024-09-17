import GenericMeetingPhase from './GenericMeetingPhase'
import Meeting from './Meeting'

export type AutogroupReflectionGroupType = {
  groupTitle: string
  reflectionIds: string[]
}

export type TranscriptBlock = {
  speaker: string
  words: string
}

interface Input {
  id?: string
  teamId: string
  meetingCount: number
  name: string
  phases: [GenericMeetingPhase, ...GenericMeetingPhase[]]
  facilitatorUserId: string
  showConversionModal?: boolean
  templateId: string
  totalVotes: number
  maxVotesPerGroup: number
  disableAnonymity: boolean
  transcription?: TranscriptBlock[]
  autogroupReflectionGroups?: AutogroupReflectionGroupType[]
  resetReflectionGroups?: AutogroupReflectionGroupType[]
  recallBotId?: string
  videoMeetingURL?: string
  meetingSeriesId?: number
  scheduledEndTime?: Date | null
}

export function isMeetingRetrospective(meeting: Meeting): meeting is MeetingRetrospective {
  return meeting.meetingType === 'retrospective'
}

export default class MeetingRetrospective extends Meeting {
  meetingType!: 'retrospective'
  showConversionModal?: boolean
  autoGroupThreshold?: number | null
  nextAutoGroupThreshold?: number | null
  totalVotes: number
  maxVotesPerGroup: number
  disableAnonymity: boolean
  // end meeting stats
  commentCount?: number
  taskCount?: number
  templateId: string
  topicCount?: number
  reflectionCount?: number
  transcription?: TranscriptBlock[]
  recallBotId?: string
  videoMeetingURL?: string
  autogroupReflectionGroups?: AutogroupReflectionGroupType[]
  resetReflectionGroups?: AutogroupReflectionGroupType[]

  constructor(input: Input) {
    const {
      id,
      showConversionModal,
      teamId,
      meetingCount,
      name,
      phases,
      facilitatorUserId,
      templateId,
      totalVotes,
      maxVotesPerGroup,
      disableAnonymity,
      transcription,
      autogroupReflectionGroups,
      resetReflectionGroups,
      recallBotId,
      videoMeetingURL,
      meetingSeriesId,
      scheduledEndTime
    } = input
    super({
      id,
      teamId,
      meetingCount,
      phases,
      facilitatorUserId,
      meetingType: 'retrospective',
      name,
      meetingSeriesId,
      scheduledEndTime
    })
    this.totalVotes = totalVotes
    this.maxVotesPerGroup = maxVotesPerGroup
    this.showConversionModal = showConversionModal
    this.templateId = templateId
    this.disableAnonymity = disableAnonymity
    this.transcription = transcription
    this.autogroupReflectionGroups = autogroupReflectionGroups
    this.resetReflectionGroups = resetReflectionGroups
    this.recallBotId = recallBotId
    this.videoMeetingURL = videoMeetingURL
  }
}
