import generateUID from '../../generateUID'
import GenericMeetingStage, {GenericMeetingStageInput} from './GenericMeetingStage'

interface Input extends Omit<GenericMeetingStageInput, 'phaseType'> {
  teamMemberId: string
  discussionId?: string
}

export default class TeamPromptResponseStage extends GenericMeetingStage {
  discussionId: string
  teamMemberId: string
  phaseType!: 'RESPONSES'
  constructor(input: Input) {
    super({...input, phaseType: 'RESPONSES'})
    const {teamMemberId, discussionId} = input
    this.teamMemberId = teamMemberId
    this.discussionId = discussionId ?? generateUID()
  }
}
