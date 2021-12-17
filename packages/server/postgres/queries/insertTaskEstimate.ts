import getPg from '../getPg'
import {
  IInsertTaskEstimateQueryParams,
  insertTaskEstimateQuery
} from './generated/insertTaskEstimateQuery'

interface Input extends Omit<IInsertTaskEstimateQueryParams, 'githubLabelName' | 'jiraFieldId'> {
  githubLabelName?: string
  jiraFieldId?: string
}

const insertTaskEstimate = async (estimate: Input) => {
  await insertTaskEstimateQuery.run(estimate as any, getPg())
}

export default insertTaskEstimate
