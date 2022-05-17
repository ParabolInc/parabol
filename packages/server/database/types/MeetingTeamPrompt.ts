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
}

export default class MeetingTeamPrompt extends Meeting {
  meetingType!: 'teamPrompt'

  constructor(input: Input) {
    const {id, teamId, meetingCount, name, phases, facilitatorUserId} = input
    super({
      id,
      teamId,
      meetingCount,
      phases,
      facilitatorUserId,
      meetingType: 'teamPrompt',
      name: name ?? `Async Standup #${meetingCount + 1}`
    })
  }
}
