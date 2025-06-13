import DataLoader from 'dataloader'
import type {Selectable} from 'kysely'
import {selectPageAccess, selectPageUserSortOrder} from '../postgres/select'
import {type PageAccess, type Pageroleenum} from '../postgres/types/pg'
import RootDataLoader from './RootDataLoader'

export const pageAccessByPageId = (parent: RootDataLoader) => {
  return new DataLoader<number, Selectable<PageAccess>[], number>(
    async (pageIds) => {
      const res = await selectPageAccess().where('pageId', 'in', pageIds).execute()
      return pageIds.map((pageId) => {
        return res.filter((r) => r.pageId === pageId)
      })
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const pageAccessByUserId = (parent: RootDataLoader) => {
  return new DataLoader<{pageId: number; userId: string}, Pageroleenum | null, string>(
    async (keys) => {
      const res = await selectPageAccess()
        .where(({eb, refTuple, tuple}) =>
          eb(
            refTuple('pageId', 'userId'),
            'in',
            keys.map((key) => tuple(key.pageId, key.userId))
          )
        )
        .execute()
      return keys.map((key) => {
        const rule = res.find(({pageId, userId}) => pageId === key.pageId && userId === key.userId)
        return rule?.role ?? null
      })
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.pageId}:${key.userId}`
    }
  )
}

export const pageUserSortOrder = (parent: RootDataLoader) => {
  return new DataLoader<{pageId: number; userId: string}, string | null, string>(
    async (keys) => {
      const res = await selectPageUserSortOrder()
        .where(({eb, refTuple, tuple}) =>
          eb(
            refTuple('pageId', 'userId'),
            'in',
            keys.map((key) => tuple(key.pageId, key.userId))
          )
        )
        .execute()
      return keys.map((key) => {
        const rule = res.find(({pageId, userId}) => pageId === key.pageId && userId === key.userId)
        return rule?.sortOrder ?? null
      })
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.pageId}:${key.userId}`
    }
  )
}
