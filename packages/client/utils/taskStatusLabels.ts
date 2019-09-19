import {TaskStatus, TaskStatusLabel} from '../types/constEnums'

const taskStatusLabels = {
  [TaskStatus.DONE]: TaskStatusLabel.DONE,
  [TaskStatus.ACTIVE]: TaskStatusLabel.ACTIVE,
  [TaskStatus.STUCK]: TaskStatusLabel.STUCK,
  [TaskStatus.FUTURE]: TaskStatusLabel.FUTURE,
}

export default taskStatusLabels
