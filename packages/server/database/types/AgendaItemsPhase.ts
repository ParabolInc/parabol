import AgendaItemsStage from './AgendaItemsStage'
import GenericMeetingPhase from './GenericMeetingPhase'

export default class AgendaItemsPhase extends GenericMeetingPhase {
  stages: AgendaItemsStage[]
  phaseType!: 'agendaitems'

  constructor(agendaItemIds: string[], durations: number[] | undefined) {
    super('agendaitems')
    this.stages = agendaItemIds.map(
      (agendaItemId) => new AgendaItemsStage({agendaItemId, durations})
    )
  }
}
