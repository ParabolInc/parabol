import type {TaskEstimateResolvers} from '../resolverTypes'

const TaskEstimate: TaskEstimateResolvers = {
  label: ({label}) => label || '',
  jiraFieldId: ({pushService, pushTargetId}) => (pushService === 'jira' ? pushTargetId : null)
}

export default TaskEstimate
