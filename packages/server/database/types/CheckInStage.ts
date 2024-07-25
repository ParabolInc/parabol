import GenericMeetingStage from './GenericMeetingStage'

export default class CheckInStage extends GenericMeetingStage {
  phaseType!: 'checkin'
  constructor(
    public teamMemberId: string,
    durations?: number[] | undefined
  ) {
    super({phaseType: 'checkin', durations})
  }
}
