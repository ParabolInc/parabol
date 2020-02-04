import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import GenericMeetingPhase from './GenericMeetingPhase'
import Meeting from './Meeting'

interface Input {
  teamId: string
  meetingCount: number
  name?: string
  phases: GenericMeetingPhase[]
  facilitatorUserId: string
}

export default class MeetingAction extends Meeting {
  taskCount?: number
  constructor(input: Input) {
    const {teamId, meetingCount, name, phases, facilitatorUserId} = input
    super({
      teamId,
      meetingCount,
      phases,
      facilitatorUserId,
      meetingType: MeetingTypeEnum.action,
      name: name ?? `Action meeting #${meetingCount + 1}`
    })
  }
}
