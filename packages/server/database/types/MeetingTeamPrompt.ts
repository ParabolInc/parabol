import type {TeamPromptPhase} from '../../postgres/types/NewMeetingPhase'
import Meeting from './Meeting'

interface Input {
  id?: string
  teamId: string
  meetingCount: number
  meetingPrompt: string
  templateId?: string | null
  name?: string
  phases: [TeamPromptPhase, ...TeamPromptPhase[]]
  facilitatorUserId: string
  meetingSeriesId?: number
  scheduledEndTime?: Date | null
}

export default class MeetingTeamPrompt extends Meeting {
  meetingType = 'teamPrompt' as const
  meetingPrompt: string
  templateId: string | null

  constructor(input: Input) {
    const {
      id,
      teamId,
      meetingCount,
      meetingPrompt,
      templateId,
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
      name,
      meetingSeriesId,
      scheduledEndTime
    })
    this.meetingPrompt = meetingPrompt
    this.templateId = templateId ?? null
  }
}
