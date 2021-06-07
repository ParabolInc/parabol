import generateUID from '../../generateUID'
import GenericMeetingStage, {GenericMeetingStageInput} from './GenericMeetingStage'

interface Input extends Omit<GenericMeetingStageInput, 'phaseType'> {
  agendaItemId: string
  discussionId?: string
}

export default class AgendaItemsStage extends GenericMeetingStage {
  discussionId: string
  agendaItemId: string
  phaseType!: 'agendaitems'
  constructor(input: Input) {
    super({...input, phaseType: 'agendaitems'})
    const {agendaItemId, discussionId} = input
    this.agendaItemId = agendaItemId
    this.discussionId = discussionId ?? generateUID()
  }
}
