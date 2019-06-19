import GenericMeetingStage from 'server/database/types/GenericMeetingStage'
import {CHECKIN} from 'universal/utils/constants'

export default class CheckInStage extends GenericMeetingStage {
  constructor (public teamMemberId: string, durations?: number[] | undefined) {
    super(CHECKIN, durations)
  }
}
