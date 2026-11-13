import type {AnyTaskIntegration} from 'parabol-client/shared/types/TaskIntegration'
import loadAzureDevOpsIssues from '../azureDevOps/loadAzureDevOpsIssues'
import loadClickUpIssues from '../clickup/loadClickUpIssues'
import loadJiraServerIssues from '../jiraServer/loadJiraServerIssues'
import type {RepoFetchCtx} from './ServerIntegrationDefinition'

/** Reads the issues behind one connection's task integrations, one result per integration in the order given. Null stands for an issue the connection cannot read */
type IssueLoader = (
  ctx: RepoFetchCtx,
  integrations: readonly AnyTaskIntegration[]
) => Promise<({service: AnyTaskIntegration['service']} | null)[]>

/**
 * The services whose issues Parabol reads itself. Jira's own loader also rewrites estimates as it reads,
 * and GitHub, GitLab and Linear issues are stitched in from those services' GraphQL APIs, so they need the request's selection
 */
const ISSUE_LOADERS = {
  azureDevOps: loadAzureDevOpsIssues,
  clickup: loadClickUpIssues,
  jiraServer: loadJiraServerIssues
} satisfies Partial<Record<AnyTaskIntegration['service'], IssueLoader>>

type LoadableService = keyof typeof ISSUE_LOADERS

export type LoadableTaskIntegration = Extract<AnyTaskIntegration, {service: LoadableService}>

/** What each service's issue GraphQL type resolves, told apart by `service` */
export type IntegrationIssue = NonNullable<
  Awaited<ReturnType<(typeof ISSUE_LOADERS)[LoadableService]>>[number]
>

const loadIssues = (
  ctx: RepoFetchCtx,
  service: LoadableService,
  integrations: readonly LoadableTaskIntegration[]
): Promise<(IntegrationIssue | null)[]> => ISSUE_LOADERS[service](ctx, integrations)

export default loadIssues
