import DataLoader from 'dataloader'
import ms from 'ms'
import type {ClickUpApiSpace} from '../integrations/clickup/ClickUpApiTypes'
import {
  ClickUpNotFoundError,
  ClickUpRateLimitError,
  ClickUpUnsharedWorkspaceError
} from '../integrations/clickup/clickUpRequest'
import fetchClickUpTask from '../integrations/clickup/fetchClickUpTask'
import type {ClickUpTaskSource} from '../integrations/clickup/mapClickUpTask'
import readClickUpCached from '../integrations/clickup/readClickUpCached'
import type {TeamMemberIntegrationAuth} from '../postgres/types'
import logError from '../utils/logError'
import type RootDataLoader from './RootDataLoader'
import settleOrLogRejection from './settleOrLogRejection'

const SPACE_MAX_AGE = ms('5m')

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

const isExpectedFailure = (error: Error) =>
  error instanceof ClickUpNotFoundError ||
  error instanceof ClickUpRateLimitError ||
  error instanceof ClickUpUnsharedWorkspaceError

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
            if (!isExpectedFailure(value)) {
              logError(value, {userId, tags: {teamId, service: 'clickup'}})
            }
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
    (auth, {taskId}) => fetchClickUpTask(auth, taskId),
    ({teamId, userId, taskId}) => `${teamId}:${userId}:${taskId}`
  )

export const clickUpSpace = (parent: RootDataLoader) =>
  makeClickUpLoader<ClickUpSpaceKey, ClickUpApiSpace>(
    parent,
    (auth, {spaceId}) =>
      readClickUpCached<ClickUpApiSpace, ClickUpApiSpace>(
        auth,
        `/space/${encodeURIComponent(spaceId)}`,
        {},
        SPACE_MAX_AGE,
        (space) => space
      ),
    ({teamId, userId, spaceId}) => `${teamId}:${userId}:${spaceId}`
  )
