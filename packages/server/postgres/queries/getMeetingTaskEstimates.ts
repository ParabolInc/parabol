import {MaybeReadonly} from 'parabol-client/types/generics'
import getPg from '../getPg'
import {getLatestTaskEstimatesQuery} from './generated/getLatestTaskEstimatesQuery'
import {IGetMeetingTaskEstimatesQueryResult} from './generated/getMeetingTaskEstimatesQuery'

export interface MeetingTaskEstimatesResult extends IGetMeetingTaskEstimatesQueryResult {
  meetingId: string
  discussionId: string
  stageId: string
}

const getMeetingTaskEstimates = async (
  taskIds: MaybeReadonly<string[]>,
  meetingIds: MaybeReadonly<string[]>
) => {
  return getLatestTaskEstimatesQuery.run({taskIds, meetingIds} as any, getPg()) as Promise<
    MeetingTaskEstimatesResult[]
  >
}

export default getMeetingTaskEstimates
