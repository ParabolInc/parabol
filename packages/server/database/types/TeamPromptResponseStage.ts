import generateUID from '../../generateUID'
import GenericMeetingStage, {type GenericMeetingStageInput} from './GenericMeetingStage'

interface Input extends Omit<GenericMeetingStageInput, 'phaseType'> {
  teamMemberId: string
  sortOrder: string
  discussionId?: string
}

export default class TeamPromptResponseStage extends GenericMeetingStage {
  discussionId: string
  teamMemberId: string
  sortOrder: string
  phaseType = 'RESPONSES' as const
  constructor(input: Input) {
    super({...input, phaseType: 'RESPONSES'})
    const {teamMemberId, sortOrder, discussionId} = input
    this.teamMemberId = teamMemberId
    this.sortOrder = sortOrder
    this.discussionId = discussionId ?? generateUID()
  }
}
