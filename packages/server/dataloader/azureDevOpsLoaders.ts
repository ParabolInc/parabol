import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import {
  AzureDevOpsUser,
  Resource,
  TeamProjectReference
} from 'parabol-client/utils/AzureDevOpsManager'
// import {AzureDevOpsAuth} from '../postgres/queries/getAzureDevOpsAuthsByUserIdTeamId'
// import getAzureDevOpsAuthByUserId from '../postgres/queries/getAzureDevOpsAuthsByUserId'
//import AzureDevOpsIssueId from 'parabol-client/shared/gqlIds/AzureDevOpsIssueId'
//import AzureDevOpsProjectId from 'parabol-client/shared/gqlIds/AzureDevOpsProjectId'
//import {SubscriptionChannel} from 'parabol-client/types/constEnums'
//import AzureDevOpsIssue from '../graphql/types/AzureDevOpsIssue'
//import publish from '../utils/publish'
//import sendToSentry from '../utils/sendToSentry'
//import upsertAzureDevOpsAuths from '../postgres/queries/upsertAzureDevOpsAuths'
import AzureDevOpsServerManager from '../utils/AzureDevOpsServerManager'
import RootDataLoader from './RootDataLoader'
import upsertTeamMemberIntegrationAuth from '../postgres/queries/upsertTeamMemberIntegrationAuth';
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'

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
          // const userAzureDevOpsAuths = await getAzureDevOpsAuthByUserId(userId)
          const azureDevOpsAuthToRefresh = await parent.get('teamMemberIntegrationAuths').load({service:'azureDevOps', teamId, userId})
          // const azureDevOpsAuthToRefresh = userAzureDevOpsAuths?.find(
          //   (azureDevOpsAuth) => azureDevOpsAuth.teamId === teamId
          // )
          if (!azureDevOpsAuthToRefresh) {
            console.log('error line 61')
            return null
          }

          const {accessToken: existingAccessToken, refreshToken} = azureDevOpsAuthToRefresh
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          const now = new Date()
          const inAMinute = Math.floor((now.getTime() + 60000) / 1000)
          if (!decodedToken || decodedToken.exp < inAMinute) {
            if (!refreshToken) {
              return null
            }
            const oauthRes = await AzureDevOpsServerManager.refresh(refreshToken)
            if (oauthRes instanceof Error) {
              //sendToSentry(oautRes)
              return null
            }
            const {accessToken, refreshToken: newRefreshToken} = oauthRes
            const updatedRefreshToken = !!newRefreshToken ? newRefreshToken : refreshToken
            // const updatedSameAccountAzureDevOpsAuths = userAzureDevOpsAuths
            //   .filter((auth) => auth.accountId === azureDevOpsAuthToRefresh.accountId)
            //   .map((auth) => ({
            //     ...auth,
            //     accessToken,
            //     refreshToken: updatedRefreshToken
            //   }))
            // console.log(updatedSameAccountAzureDevOpsAuths)
            // await upsertAzureDevOpsAuths(updatedSameAccountAzureDevOpsAuths)
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

export const azureDevUserInfo = (
  parent: RootDataLoader
): DataLoader<TeamUserKey, AzureUserInfo | undefined, string> => {
  return new DataLoader<TeamUserKey, AzureUserInfo | undefined, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId}) => {
          const auth = await parent.get('freshAzureDevOpsAuth').load({teamId, userId})
          if (!auth) return undefined
          const {accessToken} = auth
          if (!accessToken) return undefined
          const manager = new AzureDevOpsServerManager(accessToken)
          const restResult = await manager.getMe()
          const {error, azureDevOpsUser} = restResult
          if (error !== undefined || azureDevOpsUser !== undefined) {
            console.log(error)
            return undefined
          }
          const user = azureDevOpsUser as unknown as AzureDevOpsUser
          return {
            ...user
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
          if (!auth) return []
          const {accessToken} = auth

          const userInfo = await parent.get('azureDevUserInfo').load({teamId, userId})
          if (!userInfo) return []
          const {id} = userInfo

          if (!accessToken) return []
          const manager = new AzureDevOpsServerManager(accessToken)
          const results = await manager.getAccessibleOrgs(id)
          const {error, accessibleOrgs} = results
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
          if (!auth) return []
          const {accessToken} = auth
          if (!accessToken) return []
          const manager = new AzureDevOpsServerManager(accessToken)
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
          if (!accessToken) return []
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
