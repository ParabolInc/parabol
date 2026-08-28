import type {TaskEstimateResolvers} from '../resolverTypes'

const TaskEstimate: TaskEstimateResolvers = {
  label: ({label}) => label || '',
  jiraFieldId: ({pushResult}) => (pushResult?.targetKind === 'field' ? pushResult.fieldId : null)
}

export default TaskEstimate
