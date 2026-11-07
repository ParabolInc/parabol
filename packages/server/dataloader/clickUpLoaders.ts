import DataLoader from 'dataloader'
import type {ClickUpApiSpace, ClickUpApiTask} from '../integrations/clickup/ClickUpApiTypes'
import clickUpRequest from '../integrations/clickup/clickUpRequest'
import mapClickUpTask, {type ClickUpTaskSource} from '../integrations/clickup/mapClickUpTask'
import type {TeamMemberIntegrationAuth} from '../postgres/types'
import logError from '../utils/logError'
import type RootDataLoader from './RootDataLoader'
import settleOrLogRejection from './settleOrLogRejection'

interface TeamUserKey {
  teamId: string
  userId: string
}

export interface ClickUpTaskKey extends TeamUserKey {
  taskId: string
}

export interface ClickUpSpaceKey extends TeamUserKey {
  spaceId: string
}

const makeClickUpLoader = <TKey extends TeamUserKey, TValue>(
  parent: RootDataLoader,
  fetchValue: (auth: TeamMemberIntegrationAuth, key: TKey) => Promise<TValue | Error>,
  cacheKeyFn: (key: TKey) => string
) =>
  new DataLoader<TKey, TValue | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async (key) => {
          const {teamId, userId} = key
          const auth = await parent.get('freshAuth').load({service: 'clickup', teamId, userId})
          if (!auth?.accessToken) return null
          const value = await fetchValue(auth, key)
          if (value instanceof Error) {
            logError(value, {userId, tags: {teamId, service: 'clickup'}})
            return null
          }
          return value
        })
      )
      return settleOrLogRejection(results, keys)
    },
    {...parent.dataLoaderOptions, cacheKeyFn}
  )

export const clickUpTask = (parent: RootDataLoader) =>
  makeClickUpLoader<ClickUpTaskKey, ClickUpTaskSource>(
    parent,
    async (auth, {taskId}) => {
      const task = await clickUpRequest<ClickUpApiTask>(
        auth,
        `/task/${encodeURIComponent(taskId)}`,
        {query: {include_markdown_description: true}}
      )
      return task instanceof Error ? task : mapClickUpTask(task)
    },
    ({teamId, userId, taskId}) => `${teamId}:${userId}:${taskId}`
  )

export const clickUpSpace = (parent: RootDataLoader) =>
  makeClickUpLoader<ClickUpSpaceKey, ClickUpApiSpace>(
    parent,
    (auth, {spaceId}) =>
      clickUpRequest<ClickUpApiSpace>(auth, `/space/${encodeURIComponent(spaceId)}`),
    ({teamId, userId, spaceId}) => `${teamId}:${userId}:${spaceId}`
  )
