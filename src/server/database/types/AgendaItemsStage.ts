import GenericMeetingStage from 'server/database/types/GenericMeetingStage'
import {AGENDA_ITEMS} from 'universal/utils/constants'
export default class AgendaItemsStage extends GenericMeetingStage {
  constructor (public agendaItemId: string) {
    super(AGENDA_ITEMS)
  }
}
