import GenericMeetingStage from 'server/database/types/GenericMeetingStage'

export default class DiscussStage extends GenericMeetingStage {
  constructor (public sortOrder: number) {
    super()
  }
}
