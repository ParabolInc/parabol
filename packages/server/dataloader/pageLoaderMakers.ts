import DataLoader from 'dataloader'
import type {Selectable} from 'kysely'
import {PAGE_ROLES} from '../graphql/public/rules/hasPageAccess'
import {selectPageAccess, selectPageUserSortOrder} from '../postgres/select'
import type {PageAccess, Pageroleenum} from '../postgres/types/pg'
import type RootDataLoader from './RootDataLoader'

export const pageAccessByPageId = (parent: RootDataLoader) => {
  return new DataLoader<number, Selectable<PageAccess>[], number>(
    async (pageIds) => {
      const res = await selectPageAccess()
        .where('pageId', 'in', pageIds)
        .unionAll((eb) =>
          eb.parens(
            eb
              .selectFrom('PageExternalAccess')
              .select(['pageId', eb.val('*').as('userId'), 'role'])
              .where('pageId', 'in', pageIds)
              .where('email', '=', '*')
          )
        )
        .execute()
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
      const pageIds = keys.map((k) => k.pageId)
      const res = await selectPageAccess()
        .where(({eb, refTuple, tuple}) =>
          eb(
            refTuple('pageId', 'userId'),
            'in',
            keys.map((key) => tuple(key.pageId, key.userId))
          )
        )
        .unionAll((eb) =>
          eb.parens(
            eb
              .selectFrom('PageExternalAccess')
              .select(['pageId', eb.val('*').as('userId'), 'role'])
              .where('pageId', 'in', pageIds)
              .where('email', '=', '*')
          )
        )
        .execute()
      const publicRules = res.filter(({userId}) => userId === '*')
      return keys.map((key) => {
        const rule = res.find(({pageId, userId}) => pageId === key.pageId && userId === key.userId)
        const userRole = rule?.role ?? null
        if (userRole === 'owner') return userRole
        const publicRule = publicRules.find((rule) => rule.pageId === key.pageId)
        if (!publicRule) return userRole
        const publicRole = publicRule.role
        if (!userRole) return publicRole
        return PAGE_ROLES.indexOf(userRole) < PAGE_ROLES.indexOf(publicRole) ? userRole : publicRole
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
