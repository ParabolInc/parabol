import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import GenericMeetingPhase from './GenericMeetingPhase'
import UpdatesStage from './UpdatesStage'

interface TeamMember {
  id: string
  checkInOrder: number
}

export default class UpdatesPhase extends GenericMeetingPhase {
  stages: UpdatesStage[]
  constructor(teamMembers: TeamMember[], durations: number[] | undefined) {
    super(NewMeetingPhaseTypeEnum.updates)
    this.stages = teamMembers
      .sort((a, b) => (a.checkInOrder > b.checkInOrder ? 1 : -1))
      .map((teamMember) => new UpdatesStage(teamMember.id, durations))
  }
}
