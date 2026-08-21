import DataLoader from 'dataloader'
import {selectGitHubAuth, selectGitHubDimensionFieldMap} from '../postgres/select'
import type {GitHubAuth, GitHubDimensionFieldMap} from '../postgres/types'
import NullableDataLoader from './NullableDataLoader'
import type RootDataLoader from './RootDataLoader'

export const githubAuth = (parent: RootDataLoader) => {
  return new NullableDataLoader<{teamId: string; userId: string}, GitHubAuth | null, string>(
    async (keys) => {
      const rows = await selectGitHubAuth()
        .where(({eb, refTuple, tuple}) =>
          eb(
            refTuple('teamId', 'userId'),
            'in',
            keys.map((key) => tuple(key.teamId, key.userId))
          )
        )
        .where('isActive', '=', true)
        .execute()
      return keys.map(
        (key) =>
          rows.find(({teamId, userId}) => key.teamId === teamId && key.userId === userId) ?? null
      )
    },
    {...parent.dataLoaderOptions, cacheKeyFn: ({teamId, userId}) => `${userId}:${teamId}`}
  )
}

export const githubDimensionFieldMaps = (parent: RootDataLoader) => {
  return new DataLoader<
    {teamId: string; dimensionName: string; nameWithOwner: string},
    GitHubDimensionFieldMap | null,
    string
  >(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, dimensionName, nameWithOwner}) =>
          selectGitHubDimensionFieldMap()
            .where('teamId', '=', teamId)
            .where('dimensionName', '=', dimensionName)
            .where('nameWithOwner', '=', nameWithOwner)
            .executeTakeFirstOrThrow()
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, dimensionName, nameWithOwner}) =>
        `${teamId}:${dimensionName}:${nameWithOwner}`
    }
  )
}
