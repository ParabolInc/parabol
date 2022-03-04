import GenericMeetingPhase from './GenericMeetingPhase'
import Meeting from './Meeting'

interface Input {
  id?: string
  teamId: string
  meetingCount: number
  name?: string
  phases: [GenericMeetingPhase, ...GenericMeetingPhase[]]
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
      name: name ?? `Async standup #${meetingCount + 1}`
    })
  }
}
