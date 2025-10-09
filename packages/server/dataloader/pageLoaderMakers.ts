import DataLoader from 'dataloader'
import type {Selectable} from 'kysely'
import TeamMemberId from '../../client/shared/gqlIds/TeamMemberId'
import type {PageSectionEnum} from '../graphql/public/resolverTypes'
import {selectPageAccess, selectPageUserSortOrder} from '../postgres/select'
import type {PageAccess, Pageroleenum} from '../postgres/types/pg'
import {pageAccessByUserIdBatchFn} from './pageAccessByUserIdBatchFn'
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
    pageAccessByUserIdBatchFn,
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

export const pageUserSection = (parent: RootDataLoader) => {
  return new DataLoader<{pageId: number; userId: string}, PageSectionEnum, string>(
    async (keys) => {
      return Promise.all(
        keys.map(async (key) => {
          const {pageId, userId} = key
          // this determines what section the page should get put in for the viewer
          // it follows the same rules are the User.pages query
          const page = await parent.get('pages').loadNonNull(pageId)
          const {isPrivate, teamId, parentPageId} = page
          // If the page is private it's either a subpage of a private page, or its a top-level private page
          if (isPrivate) {
            return parentPageId ? 'page' : 'private'
          }
          // if it not private, has no team and no parent, it must be in shared
          if (!teamId && !parentPageId) return 'shared'
          // if it has a teamId, it's a top-level team page.
          // If the user has access to that team, it will be there, else shared
          if (teamId) {
            const teamMemberId = TeamMemberId.join(teamId, userId)
            const teamMember = await parent.get('teamMembers').load(teamMemberId)
            return teamMember ? 'team' : 'shared'
          }
          // if the page has a parent, it will be a subpage unless it doesn't have access to that parent
          if (parentPageId) {
            const hasParentAccess = await parent
              .get('pageAccessByUserId')
              .load({pageId: parentPageId, userId})
            return hasParentAccess ? 'page' : 'shared'
          }
          // unreachable as teamId/parentPageId branches have already been exhausted
          return 'shared'
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.pageId}:${key.userId}`
    }
  )
}
