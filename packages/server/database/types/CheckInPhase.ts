import {makeCheckinGreeting, makeCheckinQuestion} from 'parabol-client/utils/makeCheckinGreeting'
import {plaintextToTipTap} from '../../../client/shared/tiptap/plaintextToTipTap'
import type CheckInStage from './CheckInStage'
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
    this.checkInQuestion = JSON.stringify(
      plaintextToTipTap(makeCheckinQuestion(meetingCount, teamId))
    )
    this.stages = stages
  }
}
