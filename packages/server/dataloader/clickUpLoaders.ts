import DataLoader from 'dataloader'
import ms from 'ms'
import type {ClickUpApiSpace} from '../integrations/clickup/ClickUpApiTypes'
import {isExpectedClickUpFailure} from '../integrations/clickup/clickUpRequest'
import readClickUpCached from '../integrations/clickup/readClickUpCached'
import logError from '../utils/logError'
import type RootDataLoader from './RootDataLoader'
import settleOrLogRejection from './settleOrLogRejection'

const SPACE_MAX_AGE = ms('5m')

export interface ClickUpSpaceKey {
  teamId: string
  userId: string
  spaceId: string
}

export const clickUpSpace = (parent: RootDataLoader) =>
  new DataLoader<ClickUpSpaceKey, ClickUpApiSpace | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId, spaceId}) => {
          const auth = await parent.get('freshAuth').load({service: 'clickup', teamId, userId})
          if (!auth?.accessToken) return null
          const space = await readClickUpCached<ClickUpApiSpace, ClickUpApiSpace>(
            auth,
            `/space/${encodeURIComponent(spaceId)}`,
            {},
            SPACE_MAX_AGE,
            (space) => space
          )
          if (!(space instanceof Error)) return space
          if (!isExpectedClickUpFailure(space)) {
            logError(space, {userId, tags: {teamId, service: 'clickup'}})
          }
          return null
        })
      )
      return settleOrLogRejection(results, keys)
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, userId, spaceId}) => `${teamId}:${userId}:${spaceId}`
    }
  )
