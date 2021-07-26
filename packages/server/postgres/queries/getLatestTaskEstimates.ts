import getPg from '../getPg'
import {getLatestTaskEstimatesQuery} from './generated/getLatestTaskEstimatesQuery'

const getLatestTaskEstimates = async (taskIds: string[] | readonly string[]) => {
  return getLatestTaskEstimatesQuery.run({taskIds} as any, getPg())
}

export default getLatestTaskEstimates
