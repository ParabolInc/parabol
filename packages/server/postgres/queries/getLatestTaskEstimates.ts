import {MaybeReadonly} from '../../../client/types/generics'
import getPg from '../getPg'
import {getLatestTaskEstimatesQuery} from './generated/getLatestTaskEstimatesQuery'

const getLatestTaskEstimates = async (taskIds: MaybeReadonly<string[]>) => {
  return getLatestTaskEstimatesQuery.run({taskIds} as any, getPg())
}

export default getLatestTaskEstimates
