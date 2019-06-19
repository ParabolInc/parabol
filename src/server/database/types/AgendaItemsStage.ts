import GenericMeetingStage from 'server/database/types/GenericMeetingStage'
import {AGENDA_ITEMS} from 'universal/utils/constants'
export default class AgendaItemsStage extends GenericMeetingStage {
  constructor (public agendaItemId: string, durations?: number[] | undefined) {
    super(AGENDA_ITEMS, durations)
  }
}
