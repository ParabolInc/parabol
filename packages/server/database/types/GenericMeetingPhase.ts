import generateUID from '../../generateUID'
import GenericMeetingStage from './GenericMeetingStage'

export type NewMeetingPhaseTypeEnum =
  | 'ESTIMATE'
  | 'SCOPE'
  | 'SUMMARY'
  | 'agendaitems'
  | 'checkin'
  | 'TEAM_HEALTH'
  | 'discuss'
  | 'firstcall'
  | 'group'
  | 'lastcall'
  | 'lobby'
  | 'reflect'
  | 'updates'
  | 'vote'
  | 'RESPONSES'

export default class GenericMeetingPhase {
  id = generateUID()
  stages: GenericMeetingStage[]
  constructor(public phaseType: NewMeetingPhaseTypeEnum, durations?: number[] | undefined) {
    this.stages = [new GenericMeetingStage({phaseType, durations})]
  }
}
