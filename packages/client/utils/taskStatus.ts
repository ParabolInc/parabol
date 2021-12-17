import {TaskStatus, TaskStatusLabel} from '../types/constEnums'
import {PALETTE} from '../styles/paletteV3'

export const taskStatusLabels: Record<string, string> = {
  [TaskStatus.DONE]: TaskStatusLabel.DONE,
  [TaskStatus.ACTIVE]: TaskStatusLabel.ACTIVE,
  [TaskStatus.STUCK]: TaskStatusLabel.STUCK,
  [TaskStatus.FUTURE]: TaskStatusLabel.FUTURE
} as const

export const taskStatusColors: Record<string, string> = {
  [TaskStatus.DONE]: PALETTE.GRAPE_600,
  [TaskStatus.ACTIVE]: PALETTE.JADE_400,
  [TaskStatus.STUCK]: PALETTE.TOMATO_500,
  [TaskStatus.FUTURE]: PALETTE.AQUA_400,
  [TaskStatus.ARCHIVED]: PALETTE.SLATE_500,
  [TaskStatus.PRIVATE]: PALETTE.GOLD_300
} as const
