import GenericMeetingStage from './GenericMeetingStage'
import {CHECKIN} from '../../../client/utils/constants'

export default class CheckInStage extends GenericMeetingStage {
  constructor (public teamMemberId: string, durations?: number[] | undefined) {
    super(CHECKIN, durations)
  }
}
