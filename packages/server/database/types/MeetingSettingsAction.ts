import MeetingSettings from './MeetingSettings'
import {NewMeetingPhaseTypeEnum} from '~/__generated__/ActionMeeting_meeting.graphql'
interface Input {
  teamId: string
  id?: string
}

const phaseTypes = [
  'checkin',
  'updates',
  'firstcall',
  'agendaitems',
  'lastcall'
] as NewMeetingPhaseTypeEnum[]
export default class MeetingSettingsAction extends MeetingSettings {
  constructor(input: Input) {
    const {teamId, id} = input
    super({teamId, id, meetingType: 'action', phaseTypes})
  }
}
