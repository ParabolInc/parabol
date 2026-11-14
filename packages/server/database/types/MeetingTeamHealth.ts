import type {NewMeetingPhase} from '../../postgres/types/NewMeetingPhase'
import Meeting from './Meeting'

interface Input {
  id?: string | null
  teamId: string
  meetingCount: number
  name: string
  phases: [NewMeetingPhase, ...NewMeetingPhase[]]
  facilitatorUserId: string
  templateId: string
  meetingSeriesId?: number | null
  scheduledEndTime?: Date | null
}

export default class MeetingTeamHealth extends Meeting {
  meetingType = 'teamHealth' as const
  templateId: string

  constructor(input: Input) {
    const {
      id,
      teamId,
      meetingCount,
      name,
      phases,
      facilitatorUserId,
      templateId,
      meetingSeriesId,
      scheduledEndTime
    } = input
    super({
      id,
      teamId,
      meetingCount,
      phases,
      facilitatorUserId,
      meetingType: 'teamHealth',
      name,
      meetingSeriesId,
      scheduledEndTime
    })
    this.templateId = templateId
  }
}
