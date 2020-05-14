import GenericMeetingStage from './GenericMeetingStage'
import {UPDATES} from 'parabol-client/utils/constants'

export default class UpdatesStage extends GenericMeetingStage {
  constructor(public teamMemberId: string, durations?: number[] | undefined) {
    super(UPDATES, durations)
  }
}
