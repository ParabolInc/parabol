import AgendaItemsPhase from './AgendaItemsPhase'
import CheckInPhase from './CheckInPhase'
import GenericMeetingPhase from './GenericMeetingPhase'
import Meeting from './Meeting'
import UpdatesPhase from './UpdatesPhase'

type CheckInMeetingPhase = CheckInPhase | UpdatesPhase | GenericMeetingPhase | AgendaItemsPhase
interface Input {
  id?: string
  teamId: string
  meetingCount: number
  name?: string
  phases: [CheckInMeetingPhase, ...CheckInMeetingPhase[]]
  facilitatorUserId: string
}

export function isMeetingAction(meeting: Meeting): meeting is MeetingAction {
  return meeting.meetingType === 'action'
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
      name: name ?? `1-on-1 #${meetingCount + 1}`
    })
  }
}
