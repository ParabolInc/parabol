import {TeamPromptPhase} from '../../postgres/types/NewMeetingPhase'
import Meeting from './Meeting'

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

export default class MeetingTeamPrompt extends Meeting {
  meetingType!: 'teamPrompt'
  meetingPrompt: string

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
      name,
      meetingSeriesId,
      scheduledEndTime
    })
    this.meetingPrompt = meetingPrompt
  }
}
