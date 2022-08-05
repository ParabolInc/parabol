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

function createTeamPromptDefaultTitle() {
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  return `Standup - ${formattedDate}`
}

export default class MeetingTeamPrompt extends Meeting {
  meetingType!: 'teamPrompt'
  meetingPrompt: string
  meetingSeriesId?: number
  scheduledEndTime?: Date

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
      name: name ?? createTeamPromptDefaultTitle()
    })
    this.meetingPrompt = meetingPrompt
    this.meetingSeriesId = meetingSeriesId
    this.scheduledEndTime = scheduledEndTime
  }
}
