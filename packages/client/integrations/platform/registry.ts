import azureDevOps from '../azureDevOps'
import github from '../github'
import gitlab from '../gitlab'
import jira from '../jira'
import jiraServer from '../jiraServer'
import linear from '../linear'
import type {ClientIntegrationDefinition} from './ClientIntegrationDefinition'

export const clientIntegrations = {
  azureDevOps,
  github,
  gitlab,
  jira,
  jiraServer,
  linear
} satisfies Record<string, ClientIntegrationDefinition>

export type RegisteredClientIntegration = keyof typeof clientIntegrations

const isRegistered = (service: string): service is RegisteredClientIntegration =>
  Object.hasOwn(clientIntegrations, service)

export const getClientIntegration = (service: string): ClientIntegrationDefinition | null =>
  isRegistered(service) ? clientIntegrations[service] : null
