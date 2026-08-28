import {AzureDevOpsServerIntegration} from '../azureDevOps/AzureDevOpsServerIntegration'
import {GitHubServerIntegration} from '../github/GitHubServerIntegration'
import {GitLabServerIntegration} from '../gitlab/GitLabServerIntegration'
import {JiraServerIntegration} from '../jira/JiraServerIntegration'
import {JiraServerServerIntegration} from '../jiraServer/JiraServerServerIntegration'
import {LinearServerIntegration} from '../linear/LinearServerIntegration'
import type {ServerIntegrationDefinition} from './ServerIntegrationDefinition'

export const serverIntegrations = {
  azureDevOps: new AzureDevOpsServerIntegration(),
  github: new GitHubServerIntegration(),
  gitlab: new GitLabServerIntegration(),
  jira: new JiraServerIntegration(),
  jiraServer: new JiraServerServerIntegration(),
  linear: new LinearServerIntegration()
} satisfies Record<string, ServerIntegrationDefinition>

export type ServerIntegrations = typeof serverIntegrations
export type RegisteredServerIntegration = keyof ServerIntegrations

export const isRegisteredServerIntegration = (
  service: string
): service is RegisteredServerIntegration => Object.hasOwn(serverIntegrations, service)

export function getServerIntegration<N extends RegisteredServerIntegration>(
  service: N
): ServerIntegrations[N]
export function getServerIntegration(service: string): ServerIntegrationDefinition | null
export function getServerIntegration(service: string) {
  return isRegisteredServerIntegration(service) ? serverIntegrations[service] : null
}
