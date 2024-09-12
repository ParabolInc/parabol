import {PokerMeetingPhase} from '../../postgres/types/NewMeetingPhase'
import Meeting from './Meeting'

interface Input {
  id: string
  teamId: string
  meetingCount: number
  name: string
  phases: [PokerMeetingPhase, ...PokerMeetingPhase[]]
  facilitatorUserId: string
  templateId: string
  templateRefId: string
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
      name
    })
    this.templateId = templateId
    this.templateRefId = templateRefId
  }
}
