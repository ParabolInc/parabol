import UpdatesStage from 'server/database/types/UpdatesStage'
import GenericMeetingPhase from 'server/database/types/GenericMeetingPhase'
import {UPDATES} from 'universal/utils/constants'

interface TeamMember {
  id: string
  checkInOrder: number
}

export default class UpdatesPhase extends GenericMeetingPhase {
  stages: UpdatesStage[]
  constructor (teamMembers: TeamMember[], durations: number[] | undefined) {
    super(UPDATES)
    this.stages = teamMembers
      .sort((a, b) => (a.checkInOrder > b.checkInOrder ? 1 : -1))
      .map((teamMember) => new UpdatesStage(teamMember.id, durations))
  }
}
