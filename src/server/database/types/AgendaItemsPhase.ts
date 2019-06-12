import AgendaItemsStage from 'server/database/types/AgendaItemsStage'
import {AGENDA_ITEMS} from 'universal/utils/constants'
import GenericMeetingPhase from './GenericMeetingPhase'

export default class AgendaItemsPhase extends GenericMeetingPhase {
  stages: AgendaItemsStage[]

  constructor (agendaItemIds: string[], durations: number[] | undefined) {
    super(AGENDA_ITEMS)
    this.stages = agendaItemIds.map((id) => new AgendaItemsStage(id, durations))
  }
}
