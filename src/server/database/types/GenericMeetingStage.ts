import shortid from 'shortid'

export default class GenericMeetingStage {
  id = shortid.generate()
  meetingId
  isComplete = false
  isNavigable = false
  isNavigableByFacilitator = false
  startAt: Date | undefined = undefined
  endAt: Date | undefined = undefined
  viewCount = 0
  constructor (public phaseType: string) {}
}
