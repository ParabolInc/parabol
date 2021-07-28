import getPg from '../getPg'
import {
  IInsertTaskEstimateQueryParams,
  insertTaskEstimateQuery
} from './generated/insertTaskEstimateQuery'

const insertTaskEstimate = async (estimate: IInsertTaskEstimateQueryParams) => {
  await insertTaskEstimateQuery.run(estimate, getPg())
}

export default insertTaskEstimate
