import {DISCUSS} from './constants'

const makeDiscussionStage = (
  reflectionGroupId: string,
  meetingId: string,
  sortOrder: number,
  id: string
) => ({
  id,
  meetingId,
  isComplete: false,
  isNavigable: true,
  isNavigableByFacilitator: true,
  phaseType: DISCUSS,
  reflectionGroupId,
  sortOrder,
  startAt: sortOrder === 0 ? new Date() : undefined,
  viewCount: sortOrder === 0 ? 1 : 0
})

export default makeDiscussionStage
