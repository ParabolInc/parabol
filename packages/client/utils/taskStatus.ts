import {PALETTE} from '../styles/paletteV3'
import {TaskStatus, TaskStatusLabel} from '../types/constEnums'

export const taskStatusLabels: Record<TaskStatus, TaskStatusLabel> = {
  [TaskStatus.DONE]: TaskStatusLabel.DONE,
  [TaskStatus.ACTIVE]: TaskStatusLabel.ACTIVE,
  [TaskStatus.STUCK]: TaskStatusLabel.STUCK,
  [TaskStatus.FUTURE]: TaskStatusLabel.FUTURE,
  [TaskStatus.ARCHIVED]: TaskStatusLabel.ARCHIVED,
  [TaskStatus.PRIVATE]: TaskStatusLabel.PRIVATE
} as const

export const taskStatusColors: Record<TaskStatus, PALETTE> = {
  [TaskStatus.DONE]: PALETTE.GRAPE_600,
  [TaskStatus.ACTIVE]: PALETTE.JADE_400,
  [TaskStatus.STUCK]: PALETTE.TOMATO_500,
  [TaskStatus.FUTURE]: PALETTE.AQUA_400,
  [TaskStatus.ARCHIVED]: PALETTE.SLATE_500,
  [TaskStatus.PRIVATE]: PALETTE.GOLD_300
} as const
