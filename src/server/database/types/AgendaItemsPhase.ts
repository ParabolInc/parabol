import AgendaItemStage from 'server/database/types/AgendaItemStage'
import {AGENDA_ITEM} from 'universal/utils/constants'
import GenericMeetingPhase from './GenericMeetingPhase'

export default class AgendaItemsPhase extends GenericMeetingPhase {
  stages: AgendaItemStage[]

  constructor (agendaItemIds: string[]) {
    super(AGENDA_ITEM)
    this.stages = agendaItemIds.map((id) => new AgendaItemStage(id))
  }
}
