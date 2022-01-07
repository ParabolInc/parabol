import DataLoader from 'dataloader'
import getPg from '../postgres/getPg'
import RootDataLoader from './RootDataLoader'
import {PreparedQuery} from '@pgtyped/query'
import {Unarray, Unpromise} from 'parabol-client/types/generics'
import normalizeRethinkDbResults from './normalizeRethinkDbResults'

export function pgPrimaryLoaderMaker<
  ReturnT = void,
  QueryReturnT extends {id: string} = any
>(query: PreparedQuery<{ids: readonly string[]}, QueryReturnT>) {
  return (parent: RootDataLoader) => {
    type T = ReturnT extends void ? Unarray<Unpromise<ReturnType<typeof query.run>>> : ReturnT
    return new DataLoader<string, T, string>(
      async (ids) => {
        const result = await query.run({ids: ids as readonly string[]}, getPg())
        return normalizeRethinkDbResults(ids, result) as T[]
      },
      {
        ...parent.dataLoaderOptions
      }
    )
  }
}

