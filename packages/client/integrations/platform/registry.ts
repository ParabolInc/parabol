import type {IntegrationProviderServiceEnum} from '../../__generated__/CreateTaskIntegrationMutation.graphql'
import type {TaskServiceEnum} from '../../__generated__/CreateTaskMutation.graphql'
import {AzureDevOpsClientIntegration} from '../azureDevOps/AzureDevOpsClientIntegration'
import {ClickUpClientIntegration} from '../clickup/ClickUpClientIntegration'
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
  azureDevOps: new AzureDevOpsClientIntegration(),
  clickup: new ClickUpClientIntegration()
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

export const isRegisteredClientIntegration = (
  service: string
): service is RegisteredClientIntegration => Object.hasOwn(clientIntegrations, service)

export const isTaskClientIntegration = (
  service: IntegrationProviderServiceEnum | TaskServiceEnum
): service is TaskClientIntegration => Object.hasOwn(taskIntegrations, service)

export function getClientIntegration<N extends RegisteredClientIntegration>(
  service: N
): ClientIntegrations[N]
export function getClientIntegration(service: string): ClientIntegrationDefinition | null
export function getClientIntegration(service: string) {
  return isRegisteredClientIntegration(service) ? clientIntegrations[service] : null
}

/** The registered services among these, in popularity order, each with its definition */
export const listClientIntegrationServices = <T extends {service: string}>(
  services: readonly T[]
) =>
  clientIntegrationsByPopularity.flatMap((service) => {
    const integrationService = services.find((candidate) => candidate.service === service)
    return integrationService
      ? [{integrationService, definition: getClientIntegration(service)}]
      : []
  })
