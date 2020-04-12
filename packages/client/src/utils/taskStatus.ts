import {TaskStatus, TaskStatusLabel} from '../types/constEnums'
import {PALETTE} from '../styles/paletteV2'

export const taskStatusLabels = {
  [TaskStatus.DONE]: TaskStatusLabel.DONE,
  [TaskStatus.ACTIVE]: TaskStatusLabel.ACTIVE,
  [TaskStatus.STUCK]: TaskStatusLabel.STUCK,
  [TaskStatus.FUTURE]: TaskStatusLabel.FUTURE
}

export const taskStatusColors = {
  [TaskStatus.DONE]: PALETTE.STATUS_DONE,
  [TaskStatus.ACTIVE]: PALETTE.STATUS_ACTIVE,
  [TaskStatus.STUCK]: PALETTE.STATUS_STUCK,
  [TaskStatus.FUTURE]: PALETTE.STATUS_FUTURE,
  [TaskStatus.ARCHIVED]: PALETTE.STATUS_ARCHIVED,
  [TaskStatus.PRIVATE]: PALETTE.STATUS_PRIVATE
}
