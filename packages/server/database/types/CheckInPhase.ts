import {makeCheckinGreeting, makeCheckinQuestion} from 'parabol-client/utils/makeCheckinGreeting'
import {convertTipTapTaskContent} from '../../../client/shared/tiptap/convertTipTapTaskContent'
import CheckInStage from './CheckInStage'
import GenericMeetingPhase from './GenericMeetingPhase'

interface Input {
  teamId: string
  meetingCount: number
  stages: [CheckInStage, ...CheckInStage[]]
}
export default class CheckInPhase extends GenericMeetingPhase {
  checkInGreeting: {content: string; language: string}
  checkInQuestion: string
  stages: [CheckInStage, ...CheckInStage[]]
  phaseType!: 'checkin'

  constructor(input: Input) {
    super('checkin')
    const {teamId, meetingCount, stages} = input
    this.checkInGreeting = makeCheckinGreeting(meetingCount, teamId)
    this.checkInQuestion = convertTipTapTaskContent(makeCheckinQuestion(meetingCount, teamId))
    this.stages = stages
  }
}
