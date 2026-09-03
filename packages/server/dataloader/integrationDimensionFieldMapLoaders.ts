import DataLoader from 'dataloader'
import {selectIntegrationDimensionFieldMap} from '../postgres/select'
import type {IntegrationDimensionFieldMap} from '../postgres/types'
import type {Integrationproviderserviceenum} from '../postgres/types/pg'
import type RootDataLoader from './RootDataLoader'

export interface DimensionFieldMapKey {
  teamId: string
  service: Integrationproviderserviceenum
  repoId: string
  dimensionName: string
}

/** Every stored row for the repo/dimension across issue types, newest first; the caller picks the type-specific or fallback row */
export const integrationDimensionFieldMaps = (parent: RootDataLoader) =>
  new DataLoader<DimensionFieldMapKey, IntegrationDimensionFieldMap[], string>(
    async (keys) =>
      Promise.all(
        keys.map(({teamId, service, repoId, dimensionName}) =>
          selectIntegrationDimensionFieldMap()
            .where('teamId', '=', teamId)
            .where('service', '=', service)
            .where('repoId', '=', repoId)
            .where('dimensionName', '=', dimensionName)
            .orderBy('updatedAt', 'desc')
            .orderBy('id', 'desc')
            .execute()
        )
      ),
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, service, repoId, dimensionName}) =>
        `${teamId}:${service}:${repoId}:${dimensionName}`
    }
  )
