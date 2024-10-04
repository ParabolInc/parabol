import {CheckInMeetingPhase} from '../../postgres/types/NewMeetingPhase'
import Meeting from './Meeting'

interface Input {
  id?: string
  teamId: string
  meetingCount: number
  name: string
  phases: [CheckInMeetingPhase, ...CheckInMeetingPhase[]]
  facilitatorUserId: string
}

export default class MeetingAction extends Meeting {
  meetingType!: 'action'
  taskCount?: number
  commentCount?: number
  agendaItemCount?: number
  constructor(input: Input) {
    const {id, teamId, meetingCount, name, phases, facilitatorUserId} = input
    super({
      id,
      teamId,
      meetingCount,
      phases,
      facilitatorUserId,
      meetingType: 'action',
      name
    })
  }
}
