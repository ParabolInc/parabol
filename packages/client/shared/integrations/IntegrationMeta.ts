import type {TaskServiceEnum} from '../types/TaskIntegration'

export interface IntegrationMeta {
  service: Exclude<TaskServiceEnum, 'PARABOL'> | 'gcal'
  title: string
  description: string
}
