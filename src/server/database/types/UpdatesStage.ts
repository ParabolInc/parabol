import GenericMeetingStage from 'server/database/types/GenericMeetingStage'

export default class UpdatesStage extends GenericMeetingStage {
  constructor (public teamMemberId: string) {
    super()
  }
}
