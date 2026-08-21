import type {TaskServiceEnum} from '../types/TaskIntegration'

export type IssueParts = Record<string, string | number>

export interface IntegrationIdCodec {
  joinIssue(parts: IssueParts): string
  splitIssue(id: string): IssueParts
}

export interface IntegrationMeta {
  service: Exclude<TaskServiceEnum, 'PARABOL'>
  title: string
  description: string
  ids: IntegrationIdCodec
}
