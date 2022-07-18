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
}

export function isMeetingTeamPrompt(meeting: Meeting): meeting is MeetingTeamPrompt {
  return meeting.meetingType === 'teamPrompt'
}

function createTeamPromptDefaultTitle() {
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  return `Async Standup - ${formattedDate}`
}

export default class MeetingTeamPrompt extends Meeting {
  meetingType!: 'teamPrompt'
  meetingPrompt: string

  constructor(input: Input) {
    const {id, teamId, meetingCount, meetingPrompt, name, phases, facilitatorUserId} = input
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
  }
}
