import type {IntegrationProviderServiceEnum} from '../../__generated__/CreateTaskIntegrationMutation.graphql'
import type {TaskServiceEnum} from '../../__generated__/CreateTaskMutation.graphql'
import {AzureDevOpsClientIntegration} from '../azureDevOps/AzureDevOpsClientIntegration'
import {GcalClientIntegration} from '../gcal/GcalClientIntegration'
import {GitHubClientIntegration} from '../github/GitHubClientIntegration'
import {GitLabClientIntegration} from '../gitlab/GitLabClientIntegration'
import {JiraClientIntegration} from '../jira/JiraClientIntegration'
import {JiraServerClientIntegration} from '../jiraServer/JiraServerClientIntegration'
import {LinearClientIntegration} from '../linear/LinearClientIntegration'
import type {ClientIntegrationDefinition} from './ClientIntegrationDefinition'

/** The chat and video-meeting services have no client integration */
export type RegisteredClientIntegration = Exclude<
  IntegrationProviderServiceEnum,
  'mattermost' | 'msTeams' | 'gmeet' | 'zoom'
>

/** The services a Parabol task can link to */
export type TaskClientIntegration = Extract<RegisteredClientIntegration, TaskServiceEnum>

const taskIntegrations = {
  jira: new JiraClientIntegration(),
  jiraServer: new JiraServerClientIntegration(),
  github: new GitHubClientIntegration(),
  linear: new LinearClientIntegration(),
  gitlab: new GitLabClientIntegration(),
  azureDevOps: new AzureDevOpsClientIntegration()
} satisfies Record<TaskClientIntegration, ClientIntegrationDefinition>

export const clientIntegrations = {
  ...taskIntegrations,
  gcal: new GcalClientIntegration()
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

export const isTaskClientIntegration = (
  service: IntegrationProviderServiceEnum | TaskServiceEnum
): service is TaskClientIntegration => Object.hasOwn(taskIntegrations, service)

export const getClientIntegration = <N extends RegisteredClientIntegration>(
  service: N
): ClientIntegrations[N] => clientIntegrations[service]
