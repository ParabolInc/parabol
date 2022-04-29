import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import getAzureDevOpsDimensionFieldMaps from '../postgres/queries/getAzureDevOpsDimensionFieldMaps'
import {IntegrationProviderAzureDevOps} from '../postgres/queries/getIntegrationProvidersByIds'
import insertTaskEstimate from '../postgres/queries/insertTaskEstimate'
import upsertTeamMemberIntegrationAuth from '../postgres/queries/upsertTeamMemberIntegrationAuth'
import AzureDevOpsServerManager, {
  Resource,
  TeamProjectReference,
  WorkItem
} from '../utils/AzureDevOpsServerManager'
import sendToSentry from '../utils/sendToSentry'
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
  taskId?: string
  userId: string
  instanceId: string
  projectId: string
  viewerId: string
  workItemId: string
}

export interface AzureDevOpsWorkItemsKey {
  userId: string
  teamId: string
  instanceId: string
  projectId: string
}

export interface AzureDevOpsDimensionFieldMapKey {
  teamId: string
  dimensionName: string
  instanceId: string
  projectKey: string
}

export interface AzureDevOpsDimensionFieldMapEntry {
  teamId: string
  dimensionName: string
  fieldName: string
  fieldId: string
  instanceId: string
  fieldType: string
  projectKey: string
}

export interface AzureDevOpsWorkItem {
  id: string
  title: string
  teamProject: string
  url: string
  state: string
  type: string
  descriptionHTML: string
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
            providerId
          } = azureDevOpsAuthToRefresh
          if (!refreshToken) {
            return null
          }
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          const now = new Date()
          const inAMinute = Math.floor((now.getTime() + 60000) / 1000)
          if (!decodedToken || decodedToken.exp < inAMinute) {
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
          const restResult = await manager.getAllUserWorkItems(null, false)
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
          if (!error) console.log(error)
          if (projects !== null) resultReferences.push(...projects)
          return resultReferences
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

export const azureDevOpsDimensionFieldMap = (
  parent: RootDataLoader
): DataLoader<
  AzureDevOpsDimensionFieldMapKey,
  AzureDevOpsDimensionFieldMapEntry | null,
  string
> => {
  return new DataLoader<
    AzureDevOpsDimensionFieldMapKey,
    AzureDevOpsDimensionFieldMapEntry | null,
    string
  >(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, dimensionName, instanceId, projectKey}) => {
          return getAzureDevOpsDimensionFieldMaps(teamId, dimensionName, instanceId, projectKey)
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.dimensionName}:${key.instanceId}:${key.projectKey}`
    }
  )
}

const getProjectId = (url: URL) => {
  const firstIndex = url.pathname.indexOf('/', 1)
  const seconedIndex = url.pathname.indexOf('/', firstIndex + 1)
  return url.pathname.substring(firstIndex + 1, seconedIndex)
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
              teamProject: getProjectId(new URL(returnedWorkItem.url)),
              url: returnedWorkItem.url,
              state: returnedWorkItem.fields['System.State'],
              type: returnedWorkItem.fields['System.WorkItemType'],
              descriptionHTML: returnedWorkItem.fields['System.Description']
                ? returnedWorkItem.fields['System.Description']
                : '',
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

export const azureDevOpsWorkItem = (
  parent: RootDataLoader
): DataLoader<AzureDevOpsWorkItemKey, AzureDevOpsWorkItem | null, string> => {
  return new DataLoader<AzureDevOpsWorkItemKey, AzureDevOpsWorkItem | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId, instanceId, workItemId, taskId}) => {
          const [auth, estimates] = await Promise.all([
            parent.get('freshAzureDevOpsAuth').load({teamId, userId}),
            taskId ? parent.get('latestTaskEstimates').load(taskId) : []
          ])
          if (!auth) return null
          const provider = await parent.get('integrationProviders').loadNonNull(auth.providerId)
          const manager = new AzureDevOpsServerManager(
            auth,
            provider as IntegrationProviderAzureDevOps
          )
          const workItemDataResponse = await manager.getWorkItemData(instanceId, [
            parseInt(workItemId)
          ])
          if (workItemDataResponse instanceof Error) {
            sendToSentry(workItemDataResponse, {userId, tags: {instanceId, workItemId, teamId}})
            return null
          }
          const {workItems: returnedWorkItems} = workItemDataResponse
          if (returnedWorkItems.length !== 1 || !returnedWorkItems[0]) return null
          const returnedWorkItem = returnedWorkItems[0]
          const azureDevOpsWorkItem = {
            id: returnedWorkItem.id.toString(),
            title: returnedWorkItem.fields['System.Title'],
            teamProject: getProjectId(new URL(returnedWorkItem.url)),
            url: returnedWorkItem.url,
            state: returnedWorkItem.fields['System.State'],
            type: returnedWorkItem.fields['System.WorkItemType'],
            descriptionHTML: returnedWorkItem.fields['System.Description']
              ? returnedWorkItem.fields['System.Description']
              : '',
            service: 'azureDevOps'
          } as AzureDevOpsWorkItem

          // update our records
          await Promise.all(
            estimates.map((estimate) => {
              const {azureDevOpsFieldlName, label, discussionId, name, taskId, userId} = estimate
              if (!azureDevOpsFieldlName) {
                return undefined
              }
              let freshEstimate = ''
              if (azureDevOpsWorkItem.type === 'User Story') {
                freshEstimate = returnedWorkItem.fields['Microsoft.VSTS.Scheduling.StoryPoints']
              } else if (azureDevOpsWorkItem.type === 'Task') {
                freshEstimate =
                  returnedWorkItem.fields['Microsoft.VSTS.Scheduling.OriginalEstimate']
              }
              if (freshEstimate === label) return undefined
              // mutate current dataloader
              estimate.label = freshEstimate
              return insertTaskEstimate({
                changeSource: 'external',
                discussionId,
                azureDevOpsFieldlName,
                label: freshEstimate,
                name,
                meetingId: null,
                stageId: null,
                taskId,
                userId
              })
            })
          )
          return azureDevOpsWorkItem
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({userId, teamId, instanceId, workItemId}) =>
        `${userId}:${teamId}:${instanceId}:${workItemId}`
    }
  )
}

export const azureDevOpsWorkItems = (
  parent: RootDataLoader
): DataLoader<AzureDevOpsWorkItemsKey, AzureDevOpsWorkItem[], string> => {
  return new DataLoader<AzureDevOpsWorkItemsKey, AzureDevOpsWorkItem[], string>(
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
          const result = await manager.getWorkItems(instanceId, null, false)
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
              teamProject: getProjectId(new URL(returnedWorkItem.url)),
              url: returnedWorkItem.url,
              state: returnedWorkItem.fields['System.State'],
              type: returnedWorkItem.fields['System.WorkItemType'],
              descriptionHTML: returnedWorkItem.fields['System.Description']
                ? returnedWorkItem.fields['System.Description']
                : '',
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
