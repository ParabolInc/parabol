import GenericMeetingStage from './GenericMeetingStage'

export default class CheckInStage extends GenericMeetingStage {
  phaseType = 'checkin' as const
  constructor(
    public teamMemberId: string,
    public sortOrder: string,
    durations?: number[] | undefined
  ) {
    super({phaseType: 'checkin', durations})
  }
}
