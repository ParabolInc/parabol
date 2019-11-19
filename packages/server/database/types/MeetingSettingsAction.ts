import MeetingSettings from './MeetingSettings'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'

interface Input {
  teamId: string
  id?: string
}

const phaseTypes = [
  NewMeetingPhaseTypeEnum.checkin,
  NewMeetingPhaseTypeEnum.updates,
  NewMeetingPhaseTypeEnum.firstcall,
  NewMeetingPhaseTypeEnum.agendaitems,
  NewMeetingPhaseTypeEnum.lastcall
]
export default class MeetingSettingsAction extends MeetingSettings {
  constructor(input: Input) {
    const {teamId, id} = input
    super({teamId, id, meetingType: MeetingTypeEnum.action, phaseTypes})
  }
}
