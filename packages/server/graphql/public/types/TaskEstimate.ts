import {TaskEstimateResolvers} from '../resolverTypes'

const TaskEstimate: TaskEstimateResolvers = {
  label: ({label}) => label || ''
}

export default TaskEstimate
