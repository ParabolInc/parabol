import getPg from '../getPg'
import {removeMeetingTaskEstimatesQuery} from './generated/removeMeetingTaskEstimatesQuery'

const removeMeetingTaskEstimates = async (meetingId: string, stageId: string) => {
  return removeMeetingTaskEstimatesQuery.run({meetingId, stageId}, getPg())
}

export default removeMeetingTaskEstimates
