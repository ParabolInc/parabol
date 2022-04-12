import getPg from '../getPg'
import {
  IInsertTaskEstimateQueryParams,
  insertTaskEstimateQuery
} from './generated/insertTaskEstimateQuery'

interface Input
  extends Omit<
    IInsertTaskEstimateQueryParams,
    'gitlabLabelName' | 'githubLabelName' | 'jiraFieldId'
  > {
  gitlabLabelName?: string
  githubLabelName?: string
  jiraFieldId?: string
}

const insertTaskEstimate = async (estimate: Input) => {
  await insertTaskEstimateQuery.run(estimate as any, getPg())
}

export default insertTaskEstimate
