import {MaybeReadonly} from 'parabol-client/types/generics'
import getPg from '../getPg'
import {
  getSimilarTaskEstimateQuery,
  IGetSimilarTaskEstimateQueryResult
} from './generated/getSimilarTaskEstimateQuery'

export interface SimilarTaskEstimateResult extends IGetSimilarTaskEstimateQueryResult {}

const getSimilarTaskEstimate = async (
  taskIds: MaybeReadonly<string[]>,
  dimensionName: string,
  labelNames: MaybeReadonly<string[]>
) => {
  const [res] = await getSimilarTaskEstimateQuery.run({taskIds, dimensionName, labelNames}, getPg())
  return res as SimilarTaskEstimateResult
}

export default getSimilarTaskEstimate
