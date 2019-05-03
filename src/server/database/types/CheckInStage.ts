import GenericMeetingStage from 'server/database/types/GenericMeetingStage'

export default class CheckInStage extends GenericMeetingStage {
  constructor (public teamMemberId: string) {
    super()
  }
}
