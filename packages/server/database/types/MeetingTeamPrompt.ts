import GenericMeetingPhase from './GenericMeetingPhase'
import Meeting from './Meeting'
import TeamPromptResponsesPhase from './TeamPromptResponsesPhase'

type TeamPromptPhase = TeamPromptResponsesPhase | GenericMeetingPhase

interface Input {
  id?: string
  teamId: string
  meetingCount: number
  meetingPrompt: string
  name?: string
  phases: [TeamPromptPhase, ...TeamPromptPhase[]]
  facilitatorUserId: string
  meetingSeriesId?: number
  scheduledEndTime?: Date
}

export function isMeetingTeamPrompt(meeting: Meeting): meeting is MeetingTeamPrompt {
  return meeting.meetingType === 'teamPrompt'
}

export function createTeamPromptTitle(meetingSeriesName: string, timeZone: string) {
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone
  })

  return `${meetingSeriesName} - ${formattedDate}`
}

export default class MeetingTeamPrompt extends Meeting {
  meetingType!: 'teamPrompt'
  meetingPrompt: string

  constructor(input: Input) {
    const {
      id,
      teamId,
      meetingCount,
      meetingPrompt,
      name,
      phases,
      facilitatorUserId,
      meetingSeriesId,
      scheduledEndTime
    } = input
    super({
      id,
      teamId,
      meetingCount,
      phases,
      facilitatorUserId,
      meetingType: 'teamPrompt',
      name: createTeamPromptTitle(name ?? 'Standup', 'UTC'),
      meetingSeriesId,
      scheduledEndTime
    })
    this.meetingPrompt = meetingPrompt
  }
}
