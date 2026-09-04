import {AzureDevOpsClientIntegration} from '../azureDevOps/AzureDevOpsClientIntegration'
import {GitHubClientIntegration} from '../github/GitHubClientIntegration'
import {GitLabClientIntegration} from '../gitlab/GitLabClientIntegration'
import {JiraClientIntegration} from '../jira/JiraClientIntegration'
import {JiraServerClientIntegration} from '../jiraServer/JiraServerClientIntegration'
import {LinearClientIntegration} from '../linear/LinearClientIntegration'
import type {ClientIntegrationDefinition} from './ClientIntegrationDefinition'

export const clientIntegrations = {
  jira: new JiraClientIntegration(),
  jiraServer: new JiraServerClientIntegration(),
  github: new GitHubClientIntegration(),
  linear: new LinearClientIntegration(),
  gitlab: new GitLabClientIntegration(),
  azureDevOps: new AzureDevOpsClientIntegration()
} satisfies Record<string, ClientIntegrationDefinition>

export type ClientIntegrations = typeof clientIntegrations
export type RegisteredClientIntegration = keyof ClientIntegrations

/** Registry order is popularity order; hosts that list services sort by it */
export const clientIntegrationsByPopularity = Object.keys(
  clientIntegrations
) as RegisteredClientIntegration[]

export const compareClientIntegrationPopularity = (
  a: RegisteredClientIntegration,
  b: RegisteredClientIntegration
) => clientIntegrationsByPopularity.indexOf(a) - clientIntegrationsByPopularity.indexOf(b)

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
