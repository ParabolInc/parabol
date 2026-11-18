import type {AnyTaskIntegration} from 'parabol-client/shared/types/TaskIntegration'
import logError from '../../utils/logError'
import type {RepoFetchCtx} from '../platform/ServerIntegrationDefinition'
import getAzureDevOpsManager from './getAzureDevOpsManager'
import mapAzureDevOpsWorkItem, {type AzureDevOpsWorkItem} from './mapAzureDevOpsWorkItem'

const toIssueId = (instanceId: string, issueKey: string) =>
  `${instanceId.toLowerCase()}:${issueKey}`

/** One request per organization. Null when the issue is gone, the connection is dead, or its project is not shared with the team */
const loadAzureDevOpsIssues = async (
  ctx: RepoFetchCtx,
  integrations: readonly AnyTaskIntegration[]
): Promise<(AzureDevOpsWorkItem | null)[]> => {
  const {teamId, userId} = ctx
  const manager = await getAzureDevOpsManager(ctx)
  if (!manager) return integrations.map(() => null)
  const issueKeysByInstanceId = new Map<string, {instanceId: string; issueKeys: string[]}>()
  integrations.forEach((integration) => {
    if (integration.service !== 'azureDevOps') return
    const {instanceId, issueKey} = integration
    const instance = issueKeysByInstanceId.get(instanceId.toLowerCase())
    if (instance) instance.issueKeys.push(issueKey)
    else issueKeysByInstanceId.set(instanceId.toLowerCase(), {instanceId, issueKeys: [issueKey]})
  })
  const issuesById = new Map<string, AzureDevOpsWorkItem>()
  await Promise.all(
    [...issueKeysByInstanceId.values()].map(async ({instanceId, issueKeys}) => {
      const sharedWorkItems = await manager.getIssues(instanceId, issueKeys)
      if (sharedWorkItems instanceof Error) {
        logError(sharedWorkItems, {userId, tags: {teamId, instanceId}})
        return
      }
      sharedWorkItems.forEach((sharedWorkItem) => {
        const issue = mapAzureDevOpsWorkItem(sharedWorkItem, {instanceId, teamId, userId})
        issuesById.set(toIssueId(instanceId, issue.id), issue)
      })
    })
  )
  return integrations.map((integration) =>
    integration.service === 'azureDevOps'
      ? (issuesById.get(toIssueId(integration.instanceId, integration.issueKey)) ?? null)
      : null
  )
}

export default loadAzureDevOpsIssues
