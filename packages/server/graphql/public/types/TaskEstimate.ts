import type {TaskEstimateResolvers} from '../resolverTypes'

const TaskEstimate: TaskEstimateResolvers = {
  label: ({label}) => label || '',
  jiraFieldId: ({pushResult}) => (pushResult?.service === 'jira' ? pushResult.fieldId : null)
}

export default TaskEstimate
