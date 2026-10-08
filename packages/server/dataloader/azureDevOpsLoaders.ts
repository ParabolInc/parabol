import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import AzureDevOpsServerManager from '../integrations/azureDevOps/AzureDevOpsServerManager'
import {listAzureDevOpsEstimateFields} from '../integrations/azureDevOps/azureDevOpsEstimateFields'
import getAzureDevOpsManager from '../integrations/azureDevOps/getAzureDevOpsManager'
import mapAzureDevOpsWorkItem, {
  type AzureDevOpsWorkItem
} from '../integrations/azureDevOps/mapAzureDevOpsWorkItem'
import type {ServiceField} from '../integrations/platform/ServerIntegrationDefinition'
import syncTeamMemberIntegrationAuthTokens from '../postgres/queries/syncTeamMemberIntegrationAuthTokens'
import type {TeamMemberIntegrationAuth} from '../postgres/types'
import logError from '../utils/logError'
import handleAuthRefreshFailure from './handleAuthRefreshFailure'
import type RootDataLoader from './RootDataLoader'
import settleOrLogRejection from './settleOrLogRejection'

type TeamUserKey = {
  teamId: string
  userId: string
}

export interface AzureDevOpsWorkItemKey {
  teamId: string
  /** Whose connection reads the work item */
  userId: string
  instanceId: string
  workItemId: string
}

export interface AzureDevOpsEstimateFieldsKey {
  teamId: string
  userId: string
  instanceId: string
  projectId: string
  workItemType: string
}

const REFRESH_MARGIN_SECONDS = 60

const getTokenExpiry = (accessToken: string | null) => {
  const decoded = accessToken ? decode(accessToken) : null
  return decoded && typeof decoded === 'object' && typeof decoded.exp === 'number' ? decoded.exp : 0
}

export const freshAzureDevOpsAuth = (parent: RootDataLoader) => {
  return new DataLoader<TeamUserKey, TeamMemberIntegrationAuth | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId}) => {
          const auth = await parent
            .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
            .load({service: 'azureDevOps', teamId, userId})
          if (!auth?.refreshToken) return null
          const {accessToken: staleAccessToken, refreshToken, providerId} = auth
          const expiresSoonAt = Math.floor(Date.now() / 1000) + REFRESH_MARGIN_SECONDS
          if (getTokenExpiry(staleAccessToken) >= expiresSoonAt) return auth
          const provider = await parent.get('integrationProviders').loadNonNull(providerId)
          if (provider.service !== 'azureDevOps') return null
          const oauthRes = await new AzureDevOpsServerManager(auth, provider).refresh(refreshToken)
          if (oauthRes instanceof Error) return handleAuthRefreshFailure(oauthRes, auth)
          const tokens = {
            accessToken: oauthRes.accessToken,
            refreshToken: oauthRes.refreshToken || refreshToken,
            scopes: auth.scopes,
            expiresAt: auth.expiresAt
          }
          await syncTeamMemberIntegrationAuthTokens({
            userId,
            teamId,
            providerId,
            providerUserId: auth.providerUserId,
            ...tokens
          })
          return {...auth, ...tokens}
        })
      )
      return settleOrLogRejection(results, keys)
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.userId}:${key.teamId}`
    }
  )
}

const toWorkItemCacheKey = ({teamId, userId, instanceId, workItemId}: AzureDevOpsWorkItemKey) =>
  `${teamId}:${userId}:${instanceId.toLowerCase()}:${workItemId}`

/** Null when the work item is gone, the connection is dead, or its project is not shared with the team */
export const azureDevOpsWorkItem = (parent: RootDataLoader) => {
  return new DataLoader<AzureDevOpsWorkItemKey, AzureDevOpsWorkItem | null, string>(
    async (keys) => {
      const keysByConnection = new Map<string, AzureDevOpsWorkItemKey[]>()
      keys.forEach((key) => {
        const connection = `${key.teamId}:${key.userId}:${key.instanceId.toLowerCase()}`
        keysByConnection.set(connection, [...(keysByConnection.get(connection) ?? []), key])
      })
      const workItems = new Map<string, AzureDevOpsWorkItem>()
      await Promise.all(
        [...keysByConnection.values()].map(async (connectionKeys) => {
          const {teamId, userId, instanceId} = connectionKeys[0]!
          const manager = await getAzureDevOpsManager({dataLoader: parent, teamId, userId})
          if (!manager) return
          const ids = connectionKeys
            .map(({workItemId}) => Number(workItemId))
            .filter((id) => Number.isInteger(id) && id > 0)
          const rawWorkItems = await manager.getWorkItems(instanceId, [...new Set(ids)])
          if (rawWorkItems instanceof Error) {
            logError(rawWorkItems, {userId, tags: {teamId, instanceId}})
            return
          }
          rawWorkItems.forEach((rawWorkItem) => {
            const owner = {access: manager.access, instanceId, teamId, userId}
            const workItem = mapAzureDevOpsWorkItem(rawWorkItem, owner)
            if (!workItem) return
            workItems.set(
              toWorkItemCacheKey({teamId, userId, instanceId, workItemId: workItem.id}),
              workItem
            )
          })
        })
      )
      return keys.map((key) => workItems.get(toWorkItemCacheKey(key)) ?? null)
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: toWorkItemCacheKey
    }
  )
}

/** The fields of one work item type that can take an estimate; [] when Azure DevOps cannot list them */
export const azureDevOpsEstimateFields = (parent: RootDataLoader) => {
  return new DataLoader<AzureDevOpsEstimateFieldsKey, ServiceField[], string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId, instanceId, projectId, workItemType}) => {
          const manager = await getAzureDevOpsManager({dataLoader: parent, teamId, userId})
          if (!manager) return []
          const [projectFields, workItemTypeFieldNames] = await Promise.all([
            manager.listFields(instanceId, projectId),
            manager.listWorkItemTypeFieldNames(instanceId, projectId, workItemType)
          ])
          const fail = (error: Error): ServiceField[] => {
            logError(error, {userId, tags: {teamId, instanceId, projectId}})
            return []
          }
          if (projectFields instanceof Error) return fail(projectFields)
          if (workItemTypeFieldNames instanceof Error) return fail(workItemTypeFieldNames)
          return listAzureDevOpsEstimateFields(projectFields, workItemTypeFieldNames)
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : []))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, userId, instanceId, projectId, workItemType}) =>
        `${teamId}:${userId}:${instanceId.toLowerCase()}:${projectId}:${workItemType}`
    }
  )
}
