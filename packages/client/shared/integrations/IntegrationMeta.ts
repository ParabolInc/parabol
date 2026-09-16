import type {TaskServiceEnum} from '../types/TaskIntegration'

export interface IntegrationMeta {
  service: Exclude<TaskServiceEnum, 'PARABOL'>
  title: string
  description: string
}
