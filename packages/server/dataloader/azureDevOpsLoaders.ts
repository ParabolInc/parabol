import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import {IntegrationProviderAzureDevOps} from '../postgres/queries/getIntegrationProvidersByIds'
import upsertTeamMemberIntegrationAuth from '../postgres/queries/upsertTeamMemberIntegrationAuth'
import AzureDevOpsServerManager, {
  Resource,
  TeamProjectReference,
  WorkItem
} from '../utils/AzureDevOpsServerManager'
import RootDataLoader from './RootDataLoader'

type TeamUserKey = {
  teamId: string
  userId: string
}

export interface AzureDevOpsAccessibleOrgsKey {
  userId: string
  teamId: string
  accountId: string
}

export interface AzureDevOpsProjectsKey {
  userId: string
  teamId: string
  accountName: string
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

export interface AzureDevOpsWorkItemKey {
  teamId: string
  userId: string
  instanceId: string
  projectId: string
  viewerId: string
  workItemId: string
}

export interface AzureDevOpsUserStoriesKey {
  userId: string
  teamId: string
  instanceId: string
  projectId: string
}

export interface AzureDevOpsWorkItem {
  id: string
  title: string
  teamProject: string
  url: string
  state: string
  type: string
  service: 'azureDevOps'
}

export interface AzureUserInfo {
  displayName: string
  publicAlias: string
  emailAddress: string
  id: string
  coreRevision: number
  revision: number
  timeStamp: string
}

export const freshAzureDevOpsAuth = (
  parent: RootDataLoader
): DataLoader<TeamUserKey, IGetTeamMemberIntegrationAuthQueryResult | null, string> => {
  return new DataLoader<TeamUserKey, IGetTeamMemberIntegrationAuthQueryResult | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId}) => {
          const azureDevOpsAuthToRefresh = (await parent.get('teamMemberIntegrationAuths').load({
            service: 'azureDevOps',
            teamId,
            userId
          })) as IGetTeamMemberIntegrationAuthQueryResult | null
          if (azureDevOpsAuthToRefresh === null) {
            return null
          }
          const {
            accessToken: existingAccessToken,
            refreshToken,
            accessTokenSecret,
            providerId
          } = azureDevOpsAuthToRefresh
          if (!refreshToken) {
            return null
          }
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          const now = new Date()
          const inAMinute = Math.floor((now.getTime() + 60000) / 1000)
          if (!decodedToken || decodedToken.exp < inAMinute) {
            if (!refreshToken || !accessTokenSecret) {
              return null
            }
            const provider = await parent.get('integrationProviders').loadNonNull(providerId)
            const manager = new AzureDevOpsServerManager(
              azureDevOpsAuthToRefresh,
              provider as IntegrationProviderAzureDevOps
            )
            const oauthRes = await manager.refresh(refreshToken)
            if (oauthRes instanceof Error) {
              return null
            }
            const {accessToken, refreshToken: newRefreshToken} = oauthRes
            const updatedRefreshToken = newRefreshToken || refreshToken
            const newAzureDevOpsAuth = {
              ...azureDevOpsAuthToRefresh,
              accessToken,
              refreshToken: updatedRefreshToken
            }
            await upsertTeamMemberIntegrationAuth(newAzureDevOpsAuth)
            return newAzureDevOpsAuth
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

export const azureDevOpsAllWorkItems = (
  parent: RootDataLoader
): DataLoader<TeamUserKey, WorkItem[] | undefined, string> => {
  return new DataLoader<TeamUserKey, WorkItem[] | undefined, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId}) => {
          const returnWorkItems = [] as WorkItem[]
          const auth = await parent.get('freshAzureDevOpsAuth').load({teamId, userId})
          if (!auth) {
            return undefined
          }
          const provider = await parent.get('integrationProviders').loadNonNull(auth.providerId)
          const manager = new AzureDevOpsServerManager(
            auth,
            provider as IntegrationProviderAzureDevOps
          )

          const restResult = await manager.getAllUserWorkItems(null, null, false)
          const {error, workItems} = restResult
          if (error !== undefined || workItems === undefined) {
            console.log(error)
          } else {
            returnWorkItems.push(...workItems)
          }
          return returnWorkItems
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : undefined))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.userId}`
    }
  )
}

export const azureDevUserInfo = (
  parent: RootDataLoader
): DataLoader<TeamUserKey, AzureUserInfo | undefined, string> => {
  return new DataLoader<TeamUserKey, AzureUserInfo | undefined, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId}) => {
          const auth = await parent.get('freshAzureDevOpsAuth').load({teamId, userId})
          if (!auth) {
            return undefined
          }
          const provider = await parent.get('integrationProviders').loadNonNull(auth.providerId)
          const manager = new AzureDevOpsServerManager(
            auth,
            provider as IntegrationProviderAzureDevOps
          )
          const restResult = await manager.getMe()
          const {error, azureDevOpsUser} = restResult
          if (error !== undefined || azureDevOpsUser === undefined) {
            console.log(error)
            return undefined
          }
          return {
            ...azureDevOpsUser
          }
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : undefined))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.userId}`
    }
  )
}

export const allAzureDevOpsAccessibleOrgs = (
  parent: RootDataLoader
): DataLoader<TeamUserKey, Resource[], string> => {
  return new DataLoader<TeamUserKey, Resource[], string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId}) => {
          const auth = await parent.get('freshAzureDevOpsAuth').load({teamId, userId})
          if (!auth) {
            return []
          }
          const provider = await parent.get('integrationProviders').loadNonNull(auth.providerId)
          const manager = new AzureDevOpsServerManager(
            auth,
            provider as IntegrationProviderAzureDevOps
          )
          const userInfo = await parent.get('azureDevUserInfo').load({teamId, userId})
          if (!userInfo) return []
          const {id} = userInfo
          const results = await manager.getAccessibleOrgs(id)
          const {error, accessibleOrgs} = results
          // handle error if defined
          console.log(error)
          return accessibleOrgs.map((resource) => ({
            ...resource
          }))
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : []))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.userId}:${key.teamId}`
    }
  )
}

export const allAzureDevOpsProjects = (
  parent: RootDataLoader
): DataLoader<TeamUserKey, TeamProjectReference[], string> => {
  return new DataLoader<TeamUserKey, TeamProjectReference[], string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId}) => {
          const resultReferences = [] as TeamProjectReference[]
          const auth = await parent.get('freshAzureDevOpsAuth').load({teamId, userId})
          if (!auth) {
            return []
          }
          const provider = await parent.get('integrationProviders').loadNonNull(auth.providerId)
          if (!provider) {
            return []
          }
          const manager = new AzureDevOpsServerManager(
            auth,
            provider as IntegrationProviderAzureDevOps
          )
          const {error, projects} = await manager.getAllUserProjects()
          if (error !== undefined) {
            console.log(error)
            return []
          }
          if (projects !== null) resultReferences.push(...projects)
          return resultReferences.map((project) => ({
            ...project,
            userId,
            teamId,
            service: 'azureDevOps' as const
          }))
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : []))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.userId}:${key.teamId}`
    }
  )
}

export const azureDevOpsUserStory = (
  parent: RootDataLoader
): DataLoader<AzureDevOpsWorkItemKey, AzureDevOpsWorkItem | null, string> => {
  return new DataLoader<AzureDevOpsWorkItemKey, AzureDevOpsWorkItem | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId, instanceId, workItemId}) => {
          const auth = await parent.get('freshAzureDevOpsAuth').load({teamId, userId})
          if (!auth) {
            return null
          }
          const provider = await parent.get('integrationProviders').loadNonNull(auth.providerId)
          const manager = new AzureDevOpsServerManager(
            auth,
            provider as IntegrationProviderAzureDevOps
          )
          const workItemIds: number[] = []
          const workItemNum = parseInt(workItemId)
          if (!isNaN(workItemNum)) {
            workItemIds.push(workItemNum)
          }
          const restResult = await manager.getWorkItemData(instanceId, workItemIds)
          const {error, workItems} = restResult
          if (error !== undefined || workItems.length !== 1 || !workItems[0]) {
            console.log(error)
            return null
          } else {
            const returnedWorkItem: WorkItem = workItems[0]
            const azureDevOpsWorkItem: AzureDevOpsWorkItem = {
              id: returnedWorkItem.id.toString(),
              title: returnedWorkItem.fields['System.Title'],
              teamProject: returnedWorkItem.fields['System.TeamProject'],
              url: returnedWorkItem.url,
              state: returnedWorkItem.fields['System.State'],
              type: returnedWorkItem.fields['System.WorkItemType'],
              service: 'azureDevOps'
            }
            return azureDevOpsWorkItem
          }
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.userId}:${key.instanceId}:${key.workItemId}`
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
          if (!auth) {
            return []
          }
          const provider = await parent.get('integrationProviders').loadNonNull(auth.providerId)
          const manager = new AzureDevOpsServerManager(
            auth,
            provider as IntegrationProviderAzureDevOps
          )

          const result = await manager.getUserStories(instanceId, null, null, false)
          const {error, workItems} = result
          const workItemIds = workItems.map((workItem) => workItem.id)
          const workItemData = await manager.getWorkItemData(instanceId, workItemIds)
          const {error: workItemDataError, workItems: returnedWorkItems} = workItemData
          if (workItemDataError !== undefined) {
            console.log(error)
            return []
          }
          const mappedWorkItems: AzureDevOpsWorkItem[] = returnedWorkItems.map(
            (returnedWorkItem) => ({
              id: returnedWorkItem.id.toString(),
              title: returnedWorkItem.fields['System.Title'],
              teamProject: returnedWorkItem.fields['System.TeamProject'],
              url: returnedWorkItem.url,
              state: returnedWorkItem.fields['System.State'],
              type: returnedWorkItem.fields['System.WorkItemType'],
              service: 'azureDevOps'
            })
          )

          return mappedWorkItems
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
