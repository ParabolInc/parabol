import GenericMeetingStage from './GenericMeetingStage'
import {AGENDA_ITEMS} from 'parabol-client/src/utils/constants'
export default class AgendaItemsStage extends GenericMeetingStage {
  constructor(public agendaItemId: string, durations?: number[] | undefined) {
    super(AGENDA_ITEMS, durations)
  }
}
