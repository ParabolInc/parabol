import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import GenericMeetingPhase from './GenericMeetingPhase'
import UpdatesStage from './UpdatesStage'

export default class UpdatesPhase extends GenericMeetingPhase {
  stages: UpdatesStage[]
  constructor(teamMemberIds: string[], durations: number[] | undefined) {
    super(NewMeetingPhaseTypeEnum.updates)
    this.stages = teamMemberIds.map((id) => new UpdatesStage(id, durations))
  }
}
