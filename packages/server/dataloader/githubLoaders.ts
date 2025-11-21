import DataLoader from 'dataloader'
import {selectGitHubAuth, selectGitHubDimensionFieldMap} from '../postgres/select'
import type {GitHubAuth, GitHubDimensionFieldMap} from '../postgres/types'
import type RootDataLoader from './RootDataLoader'

export const githubAuth = (parent: RootDataLoader) => {
  return new DataLoader<{teamId: string; userId: string}, GitHubAuth | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId}) => {
          const res = await selectGitHubAuth()
            .where('userId', '=', userId)
            .where('teamId', '=', teamId)
            .where('isActive', '=', true)
            .executeTakeFirst()
          return res || null
        })
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, userId}) => `${userId}:${teamId}`
    }
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
