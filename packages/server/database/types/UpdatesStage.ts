import GenericMeetingStage from './GenericMeetingStage'

export default class UpdatesStage extends GenericMeetingStage {
  phaseType = 'updates' as const
  constructor(
    public teamMemberId: string,
    public sortOrder: string,
    durations?: number[] | undefined
  ) {
    super({phaseType: 'updates', durations})
  }
}
