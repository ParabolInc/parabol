import GenericMeetingPhase from './GenericMeetingPhase'
import Meeting from './Meeting'
import TeamPromptResponsesPhase from './TeamPromptResponsesPhase'

type TeamPromptPhase = TeamPromptResponsesPhase | GenericMeetingPhase

interface Input {
  id?: string
  teamId: string
  meetingCount: number
  name?: string
  phases: [TeamPromptPhase, ...TeamPromptPhase[]]
  facilitatorUserId: string
  meetingSeriesId?: number
  scheduledEndTime?: Date
  templateId: string
}

export function isMeetingTeamPrompt(meeting: Meeting): meeting is MeetingTeamPrompt {
  return meeting.meetingType === 'teamPrompt'
}

export function createTeamPromptTitle(
  meetingSeriesName: string,
  startTime: Date,
  timeZone: string
) {
  const formattedDate = startTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone
  })

  return `${meetingSeriesName} - ${formattedDate}`
}

export default class MeetingTeamPrompt extends Meeting {
  meetingType!: 'teamPrompt'
  /**
   * @deprecated use `templateId` instead
   */
  meetingPrompt = ''
  templateId: string

  constructor(input: Input) {
    const {
      id,
      teamId,
      meetingCount,
      name,
      phases,
      facilitatorUserId,
      meetingSeriesId,
      scheduledEndTime,
      templateId
    } = input
    super({
      id,
      teamId,
      meetingCount,
      phases,
      facilitatorUserId,
      meetingType: 'teamPrompt',
      name,
      meetingSeriesId,
      scheduledEndTime
    })
    this.templateId = templateId
  }
}
