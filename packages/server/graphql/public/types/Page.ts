import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {selectPromotionHost} from '../../../utils/tiptap/promoteSyncedBlock'
import isValid from '../../isValid'
import {canViewerOpenPage} from '../rules/canViewerOpenPage'
import type {ReqResolvers} from './ReqResolvers'

const Page: ReqResolvers<'Page'> = {
  id: ({id}) => CipherId.toClient(id, 'page'),
  access: ({id}) => ({id}),
  parentPage: async ({parentPageId}, _args, {dataLoader}) => {
    if (!parentPageId) return null
    const parentPage = await dataLoader.get('pages').load(parentPageId)
    if (!parentPage)
      throw new GraphQLError('Parent page not found', {extensions: {code: 'NOT_FOUND'}})
    return parentPage
  },
  parentPageId: ({parentPageId}) => (parentPageId ? CipherId.toClient(parentPageId, 'page') : null),
  team: async ({teamId}, _args, {dataLoader}) => {
    if (!teamId) return null
    const team = await dataLoader.get('teams').load(teamId)
    return team ?? null
  },
  userSortOrder: async ({id: pageId, userSortOrder}, _args, {authToken, dataLoader}) => {
    if (userSortOrder) return userSortOrder
    const viewerId = getUserId(authToken)
    const sortOrder = await dataLoader.get('pageUserSortOrder').load({pageId, userId: viewerId})
    return sortOrder || '!'
  },
  ancestorIds: ({ancestorIds}) => ancestorIds.map((id) => CipherId.toClient(id, 'page')),
  ancestors: async ({ancestorIds}, _args, {dataLoader}) => {
    const pages = await dataLoader.get('pages').loadMany(ancestorIds)
    const validPages = pages.filter(isValid)
    if (validPages.length < pages.length) {
      throw new GraphQLError('Page not found', {extensions: {code: 'NOT_FOUND'}})
    }
    return validPages
  },
  linkedPages: async ({id}, _args, {dataLoader}) => {
    const backlinks = await getKysely()
      .selectFrom('PageBacklink')
      .select('toPageId')
      .where('fromPageId', '=', id)
      .execute()
    const linkedPageIds = backlinks.map(({toPageId}) => toPageId)
    const pages = await dataLoader.get('pages').loadMany(linkedPageIds)
    return pages.flatMap((page) => (isValid(page) && !page.deletedAt ? [page] : []))
  },
  syncedBlockPlacements: async ({id, isSyncedBlock, parentPageId}, _args, context) => {
    if (!isSyncedBlock) return null
    const {dataLoader} = context
    const pg = getKysely()
    const loadIfOpenable = async (pageId: number | null) => {
      if (pageId === null || !(await canViewerOpenPage(context, pageId))) return null
      return (await dataLoader.get('pages').load(pageId)) ?? null
    }
    const [backlinks, successorId] = await Promise.all([
      pg
        .selectFrom('PageBacklink as b')
        .innerJoin('Page as h', 'h.id', 'b.fromPageId')
        .select('b.fromPageId')
        .where('b.toPageId', '=', id)
        .where('b.fromPageId', '<>', id)
        .where((eb) =>
          parentPageId === null
            ? eb('h.deletedAt', 'is', null)
            : eb.or([eb('h.deletedAt', 'is', null), eb('h.id', '=', parentPageId)])
        )
        .orderBy('b.createdAt')
        .orderBy('b.fromPageId')
        .execute(),
      parentPageId === null ? null : selectPromotionHost(pg, id, [parentPageId])
    ])
    const [hosts, successor] = await Promise.all([
      Promise.all(backlinks.map(({fromPageId}) => loadIfOpenable(fromPageId))),
      loadIfOpenable(successorId)
    ])
    const pages = hosts.filter(isValid)
    return {
      pages: pages.map((page) => ({page, isOriginal: page.id === parentPageId})),
      hiddenCount: hosts.length - pages.length,
      successor
    }
  },
  deletedByUser: async ({deletedBy}, _args, {dataLoader}) => {
    if (!deletedBy) return null
    const user = await dataLoader.get('users').loadNonNull(deletedBy)
    return user
  },
  lastPageExport: async ({id}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const exports = await dataLoader.get('pageExportsByPageId').load(id)
    return exports.find(({userId}) => userId === viewerId) ?? null
  }
}

export default Page
