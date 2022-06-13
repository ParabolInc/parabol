import CheckInPhase from './CheckInPhase'
import EstimatePhase from './EstimatePhase'
import GenericMeetingPhase from './GenericMeetingPhase'
import Meeting from './Meeting'

type PokerPhase = CheckInPhase | EstimatePhase | GenericMeetingPhase
interface Input {
  id: string
  teamId: string
  meetingCount: number
  name?: string
  phases: [PokerPhase, ...PokerPhase[]]
  facilitatorUserId: string
  templateId: string
  templateRefId: string
}

export function isMeetingPoker(meeting: Meeting): meeting is MeetingPoker {
  return meeting.meetingType === 'poker'
}

export default class MeetingPoker extends Meeting {
  meetingType!: 'poker'
  templateId: string
  templateRefId: string
  storyCount?: number
  commentCount?: number
  constructor(input: Input) {
    const {id, teamId, meetingCount, name, phases, facilitatorUserId, templateId, templateRefId} =
      input
    super({
      id,
      teamId,
      meetingCount,
      phases,
      facilitatorUserId,
      meetingType: 'poker',
      name: name ?? `Sprint Poker #${meetingCount + 1}`
    })
    this.templateId = templateId
    this.templateRefId = templateRefId
  }
}
