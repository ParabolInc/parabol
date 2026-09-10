import type {IntegrationProviderServiceEnum} from '../../__generated__/CreateTaskIntegrationMutation.graphql'
import type {TaskServiceEnum} from '../../__generated__/CreateTaskMutation.graphql'
import {AzureDevOpsClientIntegration} from '../azureDevOps/AzureDevOpsClientIntegration'
import {GitHubClientIntegration} from '../github/GitHubClientIntegration'
import {GitLabClientIntegration} from '../gitlab/GitLabClientIntegration'
import {JiraClientIntegration} from '../jira/JiraClientIntegration'
import {JiraServerClientIntegration} from '../jiraServer/JiraServerClientIntegration'
import {LinearClientIntegration} from '../linear/LinearClientIntegration'
import type {ClientIntegrationDefinition} from './ClientIntegrationDefinition'

/** The task services; the chat, calendar, and meeting services have no client integration */
export type RegisteredClientIntegration = Exclude<
  IntegrationProviderServiceEnum,
  'mattermost' | 'msTeams' | 'gcal' | 'gmeet' | 'zoom'
>

export const clientIntegrations = {
  jira: new JiraClientIntegration(),
  jiraServer: new JiraServerClientIntegration(),
  github: new GitHubClientIntegration(),
  linear: new LinearClientIntegration(),
  gitlab: new GitLabClientIntegration(),
  azureDevOps: new AzureDevOpsClientIntegration()
} satisfies Record<RegisteredClientIntegration, ClientIntegrationDefinition>

export type ClientIntegrations = typeof clientIntegrations

/** Registry order is popularity order; hosts that list services sort by it */
export const clientIntegrationsByPopularity = Object.keys(
  clientIntegrations
) as RegisteredClientIntegration[]

export const compareClientIntegrationPopularity = (
  a: RegisteredClientIntegration,
  b: RegisteredClientIntegration
) => clientIntegrationsByPopularity.indexOf(a) - clientIntegrationsByPopularity.indexOf(b)

export const isRegisteredClientIntegration = (
  service: IntegrationProviderServiceEnum | TaskServiceEnum
): service is RegisteredClientIntegration => Object.hasOwn(clientIntegrations, service)

export const getClientIntegration = <N extends RegisteredClientIntegration>(
  service: N
): ClientIntegrations[N] => clientIntegrations[service]
