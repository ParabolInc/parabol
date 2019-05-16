import GenericMeetingStage from 'server/database/types/GenericMeetingStage'
import {UPDATES} from 'universal/utils/constants'

export default class UpdatesStage extends GenericMeetingStage {
  constructor (public teamMemberId: string) {
    super(UPDATES)
  }
}
