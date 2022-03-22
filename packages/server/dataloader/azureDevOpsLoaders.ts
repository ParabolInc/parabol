import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import {AzureDevOpsAuth} from '../postgres/queries/getAzureDevOpsAuthsByUserIdTeamId'
import getAzureDevOpsAuthByUserId from '../postgres/queries/getAzureDevOpsAuthsByUserId'
//import AzureDevOpsIssueId from 'parabol-client/shared/gqlIds/AzureDevOpsIssueId'
//import AzureDevOpsProjectId from 'parabol-client/shared/gqlIds/AzureDevOpsProjectId'
//import {SubscriptionChannel} from 'parabol-client/types/constEnums'
//import AzureDevOpsIssue from '../graphql/types/AzureDevOpsIssue'
//import publish from '../utils/publish'
//import sendToSentry from '../utils/sendToSentry'
//import upsertAzureDevOpsAuths from '../postgres/queries/upsertAzureDevOpsAuths'
import AzureDevOpsServerManager from '../utils/AzureDevOpsServerManager'
import RootDataLoader from './RootDataLoader'

type TeamUserKey = {
  teamId: string
  userId: string
}
export interface AzureDevOpsRemoteProjectKey {
  userId: string
  teamId: string
  instanceId: string
  projectKey: string
}

export interface AzureDevOpsIssueKey {
  teamId: string
  userId: string
  instanceId: string
  issueKey: string
  viewerId: string
  taskId?: string
}

export interface AzureDevOpsUserStoriesKey {
  userId: string
  teamId: string
  instanceId: string
  projectId: string
}

export interface AzureDevOpsWorkItem {
  id: string
  url: string
}

export const freshAzureDevOpsAuth = (
  parent: RootDataLoader
): DataLoader<TeamUserKey, AzureDevOpsAuth | null, string> => {
  return new DataLoader<TeamUserKey, AzureDevOpsAuth | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId}) => {
          const userAzureDevOpsAuths = await getAzureDevOpsAuthByUserId(userId)
          const azureDevOpsAuthToRefresh = userAzureDevOpsAuths.find(
            (azureDevOpsAuth) => azureDevOpsAuth.teamId === teamId
          )
          if (!azureDevOpsAuthToRefresh) {
            console.log('error line 61')
            return null
          }

          const {accessToken: existingAccessToken, refreshToken} = azureDevOpsAuthToRefresh
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          const now = new Date()
          const inAMinute = Math.floor((now.getTime() + 60000) / 1000)
          if (!decodedToken || decodedToken.exp < inAMinute) {
            const oauthRes = await AzureDevOpsServerManager.refresh(refreshToken)
            if (oauthRes instanceof Error) {
              //sendToSentry(oautRes)
              return null
            }
            const {accessToken, refreshToken: newRefreshToken} = oauthRes
            const updatedRefreshToken = newRefreshToken ?? azureDevOpsAuthToRefresh.refreshToken
            const updatedSameAccountAzureDevOpsAuths = userAzureDevOpsAuths
              .filter((auth) => auth.accountId === azureDevOpsAuthToRefresh.accountId)
              .map((auth) => ({
                ...auth,
                accessToken,
                refreshToken: updatedRefreshToken
              }))
            console.log(updatedSameAccountAzureDevOpsAuths)
            //await upsertAzureDevOpsAuths(updatedSameAccountAzureDevOpsAuths)
            return {
              ...azureDevOpsAuthToRefresh,
              accessToken,
              refreshToken: updatedRefreshToken
            }
          }

          return azureDevOpsAuthToRefresh
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.userId}:${key.teamId}`
    }
  )
}

export const azureDevOpsUserStories = (
  parent: RootDataLoader
): DataLoader<AzureDevOpsUserStoriesKey, AzureDevOpsWorkItem[], string> => {
  return new DataLoader<AzureDevOpsUserStoriesKey, AzureDevOpsWorkItem[], string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId, instanceId}) => {
          const auth = await parent.get('freshAzureDevOpsAuth').load({teamId, userId})
          if (!auth) return []
          const {accessToken} = auth
          const manager = new AzureDevOpsServerManager(accessToken)
          const result = await manager.getUserStories(instanceId)
          const {error, workItems} = result
          console.log(error)
          return workItems.map((workItem) => ({
            id: workItem.id.toString(),
            url: workItem.url
          }))
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : []))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.projectId}:${key.teamId}:${key.instanceId}`
    }
  )
}
