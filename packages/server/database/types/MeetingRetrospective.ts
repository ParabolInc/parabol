import {AutogroupReflectionGroupType, TranscriptBlock} from '../../postgres/types'
import {RetroMeetingPhase} from '../../postgres/types/NewMeetingPhase'
import Meeting from './Meeting'

interface Input {
  id?: string | null
  teamId: string
  meetingCount: number
  name: string
  phases: [RetroMeetingPhase, ...RetroMeetingPhase[]]
  facilitatorUserId: string
  templateId: string
  totalVotes: number
  maxVotesPerGroup: number
  disableAnonymity: boolean
  transcription?: TranscriptBlock[] | null
  autogroupReflectionGroups?: AutogroupReflectionGroupType[] | null
  resetReflectionGroups?: AutogroupReflectionGroupType[] | null
  recallBotId?: string
  videoMeetingURL?: string | null
  meetingSeriesId?: number | null
  scheduledEndTime?: Date | null
}

export default class MeetingRetrospective extends Meeting {
  meetingType!: 'retrospective'
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
  transcription?: TranscriptBlock[] | null
  recallBotId?: string | null
  videoMeetingURL?: string | null
  autogroupReflectionGroups?: AutogroupReflectionGroupType[] | null
  resetReflectionGroups?: AutogroupReflectionGroupType[] | null

  constructor(input: Input) {
    const {
      id,
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
    this.templateId = templateId
    this.disableAnonymity = disableAnonymity
    this.transcription = transcription
    this.autogroupReflectionGroups = autogroupReflectionGroups
    this.resetReflectionGroups = resetReflectionGroups
    this.recallBotId = recallBotId
    this.videoMeetingURL = videoMeetingURL
  }
}
