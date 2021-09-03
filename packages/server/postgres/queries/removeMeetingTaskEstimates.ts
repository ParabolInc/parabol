import getPg from '../getPg'
import {removeMeetingTaskEstimatesQuery} from './generated/removeMeetingTaskEstimatesQuery'

const removeMeetingTaskEstimates = async (meetingId: string) => {
  return removeMeetingTaskEstimatesQuery.run({meetingId}, getPg())
}

export default removeMeetingTaskEstimates
