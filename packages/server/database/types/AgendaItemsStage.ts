import {AGENDA_ITEMS} from 'parabol-client/utils/constants'
import generateUID from '../../generateUID'
import GenericMeetingStage, {GenericMeetingStageInput} from './GenericMeetingStage'

interface Input extends Omit<GenericMeetingStageInput, 'phaseType'> {
  agendaItemId: string
  threadId?: string
}

export default class AgendaItemsStage extends GenericMeetingStage {
  threadId: string
  agendaItemId: string
  constructor(input: Input) {
    super({...input, phaseType: AGENDA_ITEMS})
    const {agendaItemId, threadId} = input
    this.agendaItemId = agendaItemId
    this.threadId = threadId ?? generateUID()
  }
}
