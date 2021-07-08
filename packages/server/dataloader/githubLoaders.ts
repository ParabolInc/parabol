import DataLoader from 'dataloader'
import JiraIssueId from 'parabol-client/shared/gqlIds/JiraIssueId'
import GitHubServerManager from '../utils/GitHubServerManager'
import RethinkDataLoader from './RethinkDataLoader'

export interface GitHubIssueKey {
  teamId: string
  userId: string
  nameWithOwner: string
  issueNumber: string
}

// interface GitHubIssueRes {
//   issueNumber: number
//   nameWithOwner: string
// }
export const githubIssue = (parent: RethinkDataLoader) => {
  return new DataLoader<GitHubIssueKey, any | null, string>(
    async (keys) => {
      const groupByUserId = {} as {[userId: string]: GitHubIssueKey[]}
      keys.forEach((key) => {
        groupByUserId[key.userId] = groupByUserId[key.userId] || []
        groupByUserId[key.userId].push(key)
      })

      const groupedKeys = Object.values(groupByUserId)

      const results = await Promise.allSettled(
        groupedKeys.map(async (keyArr) => {
          const [firstKey] = keyArr
          const {userId, teamId} = firstKey
          const auth = await parent.get('githubAuth').load({teamId, userId})
          if (!auth) return null
          const {accessToken} = auth
          const manager = new GitHubServerManager(accessToken)
          return manager as any
          // const issueRes = await manager.getIssue(nameWithOwner, issueNumber)
          // if (issueRes instanceof Error) {
          //   sendToSentry(issueRes, {userId, tags: {nameWithOwner, issueNumber, teamId}})
          //   return null
          // }
          // return {
          //   ...issueRes.fields,
          //   teamId,
          //   userId
          // }
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({nameWithOwner, issueNumber}) => JiraIssueId.join(nameWithOwner, issueNumber)
    }
  )
}
