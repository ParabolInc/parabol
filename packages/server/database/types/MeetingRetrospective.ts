import GenericMeetingPhase from './GenericMeetingPhase'
import Meeting from './Meeting'

interface Input {
  id?: string
  teamId: string
  meetingCount: number
  name?: string
  phases: GenericMeetingPhase[]
  facilitatorUserId: string
  showConversionModal?: boolean
  templateId: string
  totalVotes: number
  maxVotesPerGroup: number
}

export default class MeetingRetrospective extends Meeting {
  meetingType!: 'retrospective'
  showConversionModal?: boolean
  autoGroupThreshold?: number | null
  nextAutoGroupThreshold?: number | null
  totalVotes: number
  maxVotesPerGroup: number
  // end meeting stats
  commentCount?: number
  taskCount?: number
  templateId: string
  topicCount?: number
  reflectionCount?: number
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
      maxVotesPerGroup
    } = input
    super({
      id,
      teamId,
      meetingCount,
      phases,
      facilitatorUserId,
      meetingType: 'retrospective',
      name: name ?? `Retro #${meetingCount + 1}`
    })
    this.totalVotes = totalVotes
    this.maxVotesPerGroup = maxVotesPerGroup
    this.showConversionModal = showConversionModal
    this.templateId = templateId
  }
}
