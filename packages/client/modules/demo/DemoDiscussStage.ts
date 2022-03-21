import {RetroDemo} from '../../types/constEnums'
import DemoGenericMeetingStage from './DemoGenericMeetingStage'
import {DemoDiscussion} from './initDB'

export default class DemoDiscussStage extends DemoGenericMeetingStage {
  __typename = 'RetroDiscussStage'
  __isNewMeetingStage = 'RetroDiscussStage'

  meetingId = RetroDemo.MEETING_ID
  isComplete = false
  isNavigable = true
  isNavigableByFacilitator = true
  phaseType = 'discuss' as const
  startAt = new Date().toJSON()
  viewCount = 0
  readyCount = 0
  reflectionGroupId: string
  discussion: DemoDiscussion
  constructor(
    public id: string,
    public sortOrder: number,
    public reflectionGroup: Record<any, any> | null,
    public discussionId: string,
    db: any /* RetroDemoDB */
  ) {
    super(id, 'discuss')
    this.reflectionGroupId = reflectionGroup?.id ?? null
    this.discussion =
      db?.discussions.find((discussion: any) => discussion.id === this.discussionId) ?? null
  }
}
