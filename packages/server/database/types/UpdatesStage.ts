import {UPDATES} from 'parabol-client/utils/constants'
import GenericMeetingStage from './GenericMeetingStage'

export default class UpdatesStage extends GenericMeetingStage {
  constructor(public teamMemberId: string, durations?: number[] | undefined) {
    super({phaseType: UPDATES, durations})
  }
}
