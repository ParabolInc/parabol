import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import GenericMeetingPhase from './GenericMeetingPhase'
import Meeting from './Meeting'

interface Input {
  teamId: string
  meetingCount: number
  name?: string
  phases: GenericMeetingPhase[]
  facilitatorUserId: string
  showConversionModal?: boolean
}

export default class MeetingRetrospective extends Meeting {
  showConversionModal?: boolean
  autoGroupThreshold?: number | null
  nextAutoGroupThreshold?: number | null
  constructor(input: Input) {
    const {showConversionModal, teamId, meetingCount, name, phases, facilitatorUserId} = input
    super({
      teamId,
      meetingCount,
      phases,
      facilitatorUserId,
      meetingType: MeetingTypeEnum.retrospective,
      name: name ?? `Retro #${meetingCount + 1}`
    })
    this.showConversionModal = showConversionModal
  }
}
