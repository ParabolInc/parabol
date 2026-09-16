import {selectGitHubAuth} from '../postgres/select'
import type {GitHubAuth} from '../postgres/types'
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
