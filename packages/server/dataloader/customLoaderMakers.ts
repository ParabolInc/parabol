import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import promiseAllPartial from 'parabol-client/utils/promiseAllPartial'
import getRethink from '../database/rethinkDriver'
import AtlassianManager from '../utils/AtlassianManager'
import AzureDevopsManager from '../utils/AzureDevopsManager'
import RethinkDataLoader from './RethinkDataLoader'
import {DataLoaderType} from 'parabol-client/types/constEnums'

type AccessTokenKey = {teamId: string; userId: string}
interface JiraRemoteProjectKey {
  accessToken: string
  cloudId: string
  atlassianProjectId: string
}

interface AzureDevopsRemoteProjectKey {
  accessToken: string
  organization: string
  azureDevopsProjectId: string
}

class LoaderMakerCustom<T> {
  type = DataLoaderType.CUSTOM
  constructor(public fn: (parent: RethinkDataLoader) => DataLoader<T, string, string>) {}
}

export const freshAtlassianAccessToken = new LoaderMakerCustom((parent: RethinkDataLoader) => {
  const userAuthLoader = parent.get('atlassianAuthByUserId')
  return new DataLoader<AccessTokenKey, string, string>(
    async (keys) => {
      return promiseAllPartial(
        keys.map(async ({userId, teamId}) => {
          const userAuths = await userAuthLoader.load(userId)
          const teamAuth = userAuths.find((auth) => auth.teamId === teamId)
          if (!teamAuth || !teamAuth.refreshToken) return null
          const {accessToken: existingAccessToken, refreshToken} = teamAuth
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          const now = new Date()
          if (decodedToken && decodedToken.exp >= Math.floor(now.getTime() / 1000)) {
            return existingAccessToken
          }
          // fetch a new one
          const manager = await AtlassianManager.refresh(refreshToken)
          const {accessToken} = manager
          const r = await getRethink()
          await r
            .table('AtlassianAuth')
            .getAll(userId, {index: 'userId'})
            .filter({teamId})
            .update({accessToken, updatedAt: now})
            .run()
          return accessToken
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key: AccessTokenKey) => `${key.userId}:${key.teamId}`
    }
  )
})

export const jiraRemoteProject = new LoaderMakerCustom((parent: RethinkDataLoader) => {
  return new DataLoader<JiraRemoteProjectKey, string, string>(
    async (keys) => {
      return promiseAllPartial(
        keys.map(async ({accessToken, cloudId, atlassianProjectId}) => {
          const manager = new AtlassianManager(accessToken)
          return manager.getProject(cloudId, atlassianProjectId)
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key: JiraRemoteProjectKey) => `${key.atlassianProjectId}:${key.cloudId}`
    }
  )
})

// Azure Devops
export const freshAzureDevopsAccessToken = new LoaderMakerCustom((parent: RethinkDataLoader) => {
  const userAuthLoader = parent.get('azureDevopsAuthByUserId')
  return new DataLoader<AccessTokenKey, string, string>(
    async (keys) => {
      return promiseAllPartial(
        keys.map(async ({userId, teamId}) => {
          const userAuths = await userAuthLoader.load(userId)
          const teamAuth = userAuths.find((auth) => auth.teamId === teamId)
          if (!teamAuth || !teamAuth.refreshToken) return null
          const {accessToken: existingAccessToken, refreshToken} = teamAuth
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          const now = new Date()
          if (decodedToken && decodedToken.exp >= Math.floor(now.getTime() / 1000)) {
            return existingAccessToken
          }
          // fetch a new one
          const manager = await AzureDevopsManager.refresh(refreshToken)
          const {accessToken} = manager
          const r = await getRethink()
          await r
            .table('AzureDevopsAuth')
            .getAll(userId, {index: 'userId'})
            .filter({teamId})
            .update({accessToken, updatedAt: now})
            .run()
          return accessToken
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key: AccessTokenKey) => `${key.userId}:${key.teamId}`
    }
  )
})

export const azureDevopsRemoteProject = new LoaderMakerCustom((parent: RethinkDataLoader) => {
  return new DataLoader<AzureDevopsRemoteProjectKey, string, string>(
    async (keys) => {
      return promiseAllPartial(
        keys.map(async ({accessToken, organization, azureDevopsProjectId}) => {
          const manager = new AtlassianManager(accessToken)
          return manager.getProject(organization, azureDevopsProjectId)
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key: AzureDevopsRemoteProjectKey) =>
        `${key.azureDevopsProjectId}:${key.organization}`
    }
  )
})
