import azureDevOps from '../azureDevOps'
import github from '../github'
import gitlab from '../gitlab'
import jira from '../jira'
import jiraServer from '../jiraServer'
import linear from '../linear'
import type {ServerIntegrationDefinition} from './ServerIntegrationDefinition'

export const serverIntegrations = {
  azureDevOps,
  github,
  gitlab,
  jira,
  jiraServer,
  linear
} satisfies Record<string, ServerIntegrationDefinition>

export type RegisteredServerIntegration = keyof typeof serverIntegrations

const isRegistered = (service: string): service is RegisteredServerIntegration =>
  Object.hasOwn(serverIntegrations, service)

export const getServerIntegration = (service: string): ServerIntegrationDefinition | null =>
  isRegistered(service) ? serverIntegrations[service] : null
