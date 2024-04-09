import GenericMeetingStage from './GenericMeetingStage'

export default class UpdatesStage extends GenericMeetingStage {
  phaseType!: 'updates'
  constructor(
    public teamMemberId: string,
    durations?: number[] | undefined
  ) {
    super({phaseType: 'updates', durations})
  }
}
