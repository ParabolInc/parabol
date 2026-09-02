import DataLoader from 'dataloader'
import getLinearDimensionFieldMaps, {
  type LinearDimensionFieldMap
} from '../postgres/queries/getLinearDimensionFieldMaps'
import type RootDataLoader from './RootDataLoader'

export const linearDimensionFieldMaps = (parent: RootDataLoader) => {
  return new DataLoader<
    {teamId: string; dimensionName: string; repoId: string},
    LinearDimensionFieldMap | null,
    string
  >(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, dimensionName, repoId}) =>
          getLinearDimensionFieldMaps(teamId, dimensionName, repoId)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, dimensionName, repoId}) => `${teamId}:${dimensionName}:${repoId}`
    }
  )
}
