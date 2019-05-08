import GenericMeetingPhase from 'server/database/types/GenericMeetingPhase'
import shortid from 'shortid'

export type MeetingType = 'action' | 'retrospective'
export default class Meeting {
  id = shortid.generate()
  createdAt = new Date()
  updatedAt = new Date()
  endedAt: Date | undefined = undefined
  facilitatorStageId: string
  meetingNumber: number
  isAsync: undefined
  constructor (
    public teamId: string,
    public meetingType: MeetingType,
    meetingCount: number,
    public phases: GenericMeetingPhase[],
    public facilitatorUserId: string
  ) {
    this.meetingNumber = meetingCount + 1
    this.facilitatorStageId = phases[0].stages[0].id
  }
}
