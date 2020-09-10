import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import convertToTaskContent from 'parabol-client/utils/draftjs/convertToTaskContent'
import {makeCheckinGreeting, makeCheckinQuestion} from 'parabol-client/utils/makeCheckinGreeting'
import CheckInStage from './CheckInStage'
import GenericMeetingPhase from './GenericMeetingPhase'

export default class CheckInPhase extends GenericMeetingPhase {
  checkInGreeting: {content: string; language: string}
  checkInQuestion: string
  stages: CheckInStage[]

  constructor(teamId: string, meetingCount: number, teamMemberIds: string[]) {
    super(NewMeetingPhaseTypeEnum.checkin)
    this.checkInGreeting = makeCheckinGreeting(meetingCount, teamId)
    this.checkInQuestion = convertToTaskContent(makeCheckinQuestion(meetingCount, teamId))
    this.stages = teamMemberIds.map((id) => new CheckInStage(id))
  }
}
