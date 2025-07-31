import type {MaybeReadonly} from 'parabol-client/types/generics'
import getPg from '../getPg'
import {
  getMeetingTaskEstimatesQuery,
  type IGetMeetingTaskEstimatesQueryResult
} from './generated/getMeetingTaskEstimatesQuery'

export interface MeetingTaskEstimatesResult extends IGetMeetingTaskEstimatesQueryResult {
  meetingId: string
  discussionId: string
  stageId: string
}

const getMeetingTaskEstimates = async (
  taskIds: MaybeReadonly<string[]>,
  meetingIds: MaybeReadonly<string[]>
) => {
  return getMeetingTaskEstimatesQuery.run({taskIds, meetingIds}, getPg()) as Promise<
    MeetingTaskEstimatesResult[]
  >
}

export default getMeetingTaskEstimates
