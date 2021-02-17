import GenericMeetingPhase from './GenericMeetingPhase'
import DimensionScaleMapping, {DimensionScaleMappingInput} from './DimensionScaleMapping'
import Meeting from './Meeting'

interface Input {
  teamId: string
  meetingCount: number
  name?: string
  phases: GenericMeetingPhase[]
  facilitatorUserId: string
  templateId: string
  dimensionScaleMapping: DimensionScaleMapping[]
}

export default class MeetingPoker extends Meeting {
  templateId: string
  storyCount?: number
  dimensionScaleMapping: DimensionScaleMappingInput[]
  constructor(input: Input) {
    const {
      teamId,
      meetingCount,
      name,
      phases,
      facilitatorUserId,
      templateId,
      dimensionScaleMapping
    } = input
    super({
      teamId,
      meetingCount,
      phases,
      facilitatorUserId,
      meetingType: 'poker',
      name: name ?? `Sprint Poker #${meetingCount + 1}`
    })
    this.templateId = templateId
    this.dimensionScaleMapping = dimensionScaleMapping
  }
}
