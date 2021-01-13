import shortid from 'shortid'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'

interface Input {
  id?: string
  phaseTypes: NewMeetingPhaseTypeEnum[]
  meetingType: MeetingTypeEnum
  teamId: string
}

export default abstract class MeetingSettings {
  id: string
  phaseTypes: NewMeetingPhaseTypeEnum[]
  meetingType: MeetingTypeEnum
  teamId: string

  constructor(input: Input) {
    const {id, meetingType, phaseTypes, teamId} = input
    this.id = id ?? shortid.generate()
    this.meetingType = meetingType
    this.teamId = teamId
    this.phaseTypes = phaseTypes
  }
}
