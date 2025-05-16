import DataLoader from 'dataloader'
import {Selectable} from 'kysely'
import getKysely from '../postgres/getKysely'
import {LinearDimensionFieldMap} from '../postgres/types/pg'
import type RootDataLoader from './RootDataLoader'

type LinearDimensionFieldMapKey = Omit<Selectable<LinearDimensionFieldMap>, 'id' | 'labelTemplate'>

export const linearDimensionFieldMaps = (parent: RootDataLoader) => {
  return new DataLoader<
    LinearDimensionFieldMapKey,
    Selectable<LinearDimensionFieldMap> | null,
    string
  >(
    async (keys) => {
      const pg = getKysely()
      return Promise.all(
        keys.map(async (key): Promise<Selectable<LinearDimensionFieldMap> | null> => {
          const {teamId, dimensionName, repoId} = key
          if (!teamId || !dimensionName || !repoId) return null
          const res = await pg
            .selectFrom('LinearDimensionFieldMap')
            .selectAll()
            .where('teamId', '=', teamId)
            .where('dimensionName', '=', dimensionName)
            .where('repoId', '=', repoId)
            .limit(1)
            .executeTakeFirst()
          return res || null
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.dimensionName}:${key.repoId}`
    }
  )
}
