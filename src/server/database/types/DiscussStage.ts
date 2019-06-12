import GenericMeetingStage from 'server/database/types/GenericMeetingStage'
import {DISCUSS} from 'universal/utils/constants'

export default class DiscussStage extends GenericMeetingStage {
  constructor (public sortOrder: number, durations: number[] | undefined) {
    super(DISCUSS, durations)
  }
}
