import {AzureDevOpsClientIntegration} from '../azureDevOps/AzureDevOpsClientIntegration'
import {GitHubClientIntegration} from '../github/GitHubClientIntegration'
import {GitLabClientIntegration} from '../gitlab/GitLabClientIntegration'
import {JiraClientIntegration} from '../jira/JiraClientIntegration'
import {JiraServerClientIntegration} from '../jiraServer/JiraServerClientIntegration'
import {LinearClientIntegration} from '../linear/LinearClientIntegration'
import type {ClientIntegrationDefinition} from './ClientIntegrationDefinition'

export const clientIntegrations = {
  azureDevOps: new AzureDevOpsClientIntegration(),
  github: new GitHubClientIntegration(),
  gitlab: new GitLabClientIntegration(),
  jira: new JiraClientIntegration(),
  jiraServer: new JiraServerClientIntegration(),
  linear: new LinearClientIntegration()
} satisfies Record<string, ClientIntegrationDefinition>

export type ClientIntegrations = typeof clientIntegrations
export type RegisteredClientIntegration = keyof ClientIntegrations

export const isRegisteredClientIntegration = (
  service: string
): service is RegisteredClientIntegration => Object.hasOwn(clientIntegrations, service)

export function getClientIntegration<N extends RegisteredClientIntegration>(
  service: N
): ClientIntegrations[N]
export function getClientIntegration(service: string): ClientIntegrationDefinition | null
export function getClientIntegration(service: string) {
  return isRegisteredClientIntegration(service) ? clientIntegrations[service] : null
}
