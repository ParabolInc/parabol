import getPg from '../getPg'
import {
  IInsertTaskEstimateQueryParams,
  insertTaskEstimateQuery
} from './generated/insertTaskEstimateQuery'

interface Input
  extends Omit<
    IInsertTaskEstimateQueryParams,
    'githubLabelName' | 'jiraFieldId' | 'azureDevOpsFieldlName'
  > {
  githubLabelName?: string
  jiraFieldId?: string
  azureDevOpsFieldlName?: string
}

const insertTaskEstimate = async (estimate: Input) => {
  await insertTaskEstimateQuery.run(estimate as any, getPg())
}

export default insertTaskEstimate
