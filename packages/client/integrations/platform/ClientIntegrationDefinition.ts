import type Atmosphere from '../../Atmosphere'
import type {MenuMutationProps} from '../../hooks/useMutationProps'
import type {TaskServiceEnum} from '../../shared/types/TaskIntegration'

export type IssueParts = Record<string, string | number>

export interface IntegrationIdCodec {
  joinIssue(parts: IssueParts): string
  splitIssue(id: string): IssueParts
}

export interface ConnectProvider {
  id: string
  clientId: string
  serverBaseUrl: string
  tenantId: string | null
}

export interface ConnectParams {
  teamId: string
  mutationProps: MenuMutationProps
  provider?: ConnectProvider
}

export interface ClientIntegrationDefinition {
  service: Exclude<TaskServiceEnum, 'PARABOL'>
  label: string
  description: string
  ids: IntegrationIdCodec
  connect: {
    open(atmosphere: Atmosphere, params: ConnectParams): void
  }
}
