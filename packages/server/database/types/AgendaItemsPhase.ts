import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import AgendaItemsStage from './AgendaItemsStage'
import GenericMeetingPhase from './GenericMeetingPhase'

export default class AgendaItemsPhase extends GenericMeetingPhase {
  stages: AgendaItemsStage[]

  constructor(agendaItemIds: string[], durations: number[] | undefined) {
    super(NewMeetingPhaseTypeEnum.agendaitems)
    this.stages = agendaItemIds.map((id) => new AgendaItemsStage(id, durations))
  }
}
