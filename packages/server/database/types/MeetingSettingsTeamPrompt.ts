import {NewMeetingPhaseTypeEnum} from './GenericMeetingPhase'
import MeetingSettings from './MeetingSettings'
interface Input {
  teamId: string
  id?: string
}

const phaseTypes = ['RESPONSES'] as NewMeetingPhaseTypeEnum[]
export default class MeetingSettingsTeamPrompt extends MeetingSettings {
  constructor(input: Input) {
    const {teamId, id} = input
    super({teamId, id, meetingType: 'teamPrompt', phaseTypes})
  }
}
