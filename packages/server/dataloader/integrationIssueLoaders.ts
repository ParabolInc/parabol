import DataLoader from 'dataloader'
import stringify from 'fast-json-stable-stringify'
import loadIssues, {
  type IntegrationIssue,
  type LoadableTaskIntegration
} from '../integrations/platform/loadIssues'
import logError from '../utils/logError'
import type RootDataLoader from './RootDataLoader'

export interface IntegrationIssueKey {
  teamId: string
  /** The issue as its Task row stores it, read through its accessUserId's connection */
  integration: LoadableTaskIntegration
}

const toCacheKey = ({teamId, integration}: IntegrationIssueKey) =>
  `${teamId}:${stringify(integration)}`

/** The issue a task links to, batched per connection. Null when the issue is gone, the connection is dead, or the connection does not share it with the team */
export const integrationIssue = (parent: RootDataLoader) => {
  return new DataLoader<IntegrationIssueKey, IntegrationIssue | null, string>(
    async (keys) => {
      const keysByConnection = Map.groupBy(
        keys,
        ({teamId, integration}) => `${integration.service}:${teamId}:${integration.accessUserId}`
      )
      const issueByKey = new Map<IntegrationIssueKey, IntegrationIssue | null>()
      await Promise.all(
        [...keysByConnection.values()].map(async (connectionKeys) => {
          const {teamId, integration} = connectionKeys[0]!
          const {service, accessUserId: userId} = integration
          try {
            const issues = await loadIssues(
              {dataLoader: parent, teamId, userId},
              service,
              connectionKeys.map((key) => key.integration)
            )
            connectionKeys.forEach((key, idx) => {
              issueByKey.set(key, issues[idx] ?? null)
            })
          } catch (e) {
            const error = e instanceof Error ? e : new Error(String(e))
            logError(error, {userId, tags: {teamId, service}})
          }
        })
      )
      return keys.map((key) => issueByKey.get(key) ?? null)
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: toCacheKey
    }
  )
}
