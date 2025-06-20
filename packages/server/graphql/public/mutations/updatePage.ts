import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {hocusPocusHub} from '../../../utils/tiptap/hocusPocusHub'
import {MutationResolvers} from '../resolverTypes'
import {getPageNextSortOrder} from './helpers/getPageNextSortOrder'
import {movePageToNewParent} from './helpers/movePageToNewParent'
import {movePageToNewTeam} from './helpers/movePageToNewTeam'
import {movePageToTopLevel} from './helpers/movePageToTopLevel'
import {privatizePage} from './helpers/privatizePage'

export const MAX_PAGE_DEPTH = 10
const updatePage: MutationResolvers['updatePage'] = async (
  _source,
  {pageId, teamId, sortOrder, parentPageId, makePrivate},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const [dbPageId] = CipherId.fromClient(pageId)
  const dbParentPageId = parentPageId ? CipherId.fromClient(parentPageId)[0] : null
  if (teamId && parentPageId) {
    throw new GraphQLError('Can only provider either parentPageId OR teamId')
  }
  if (makePrivate && (teamId || dbParentPageId)) {
    throw new GraphQLError('makePrivate can only be true if teamId and parentPageId are null')
  }

  const page = await dataLoader.get('pages').load(dbPageId)
  dataLoader.get('pages').clearAll()
  if (!page) throw new GraphQLError('Invalid pageId')
  const hasChangedParent = page.teamId !== teamId || page.parentPageId !== dbParentPageId
  if (hasChangedParent || makePrivate) {
    // changing parents will change permissions.
    const userRole = await dataLoader
      .get('pageAccessByUserId')
      .load({pageId: dbPageId, userId: viewerId})
    dataLoader.get('pageAccessByUserId').clearAll()
    if (userRole !== 'owner') {
      throw new GraphQLError('You must be an owner to move the page to a different parent', {
        extensions: {code: 'FOOB_AR'}
      })
    }
  }

  const nextSortOrder = await getPageNextSortOrder(
    sortOrder,
    viewerId,
    page.isPrivate,
    teamId || null,
    dbParentPageId
  )
  const pg = getKysely()
  if (makePrivate && !page.isPrivate) {
    await privatizePage(viewerId, dbPageId, nextSortOrder)
  } else if (teamId && teamId !== page.teamId) {
    await movePageToNewTeam(viewerId, dbPageId, teamId, nextSortOrder)
  } else if (dbParentPageId && dbParentPageId !== page.parentPageId) {
    const parentPage = await dataLoader.get('pages').load(dbParentPageId)
    if (!parentPage) {
      throw new GraphQLError('Invalid parentPageId')
    }
    const {ancestorIds} = parentPage
    if (ancestorIds.length >= MAX_PAGE_DEPTH) {
      throw new GraphQLError(`Pages can only be nested ${MAX_PAGE_DEPTH} pages deep`, {
        extensions: {code: 'MAX_PAGE_DEPTH_REACHED'}
      })
    }
    if (ancestorIds.includes(dbPageId) || dbParentPageId === dbPageId) {
      throw new GraphQLError(`Circular reference found. A page cannot be nested in itself`)
    }
    await movePageToNewParent(viewerId, dbPageId, dbParentPageId, nextSortOrder, ancestorIds)
  } else if (teamId === page.teamId || dbParentPageId === page.parentPageId) {
    // simple reorder
    await pg
      .updateTable('Page')
      .set({sortOrder: nextSortOrder})
      .where('id', '=', dbPageId)
      .execute()
  } else if (!teamId && !parentPageId) {
    await movePageToTopLevel(viewerId, dbPageId, nextSortOrder)
  } else {
    throw new GraphQLError('No page update could be performed')
  }

  if (page.parentPageId || dbParentPageId) {
    // if it had a parent or it has a parent, update the auto link
    hocusPocusHub.emit('moveChildPageLink', {
      oldParentPageId: page.parentPageId,
      newParentPageId: dbParentPageId,
      childPageId: dbPageId,
      title: page.title,
      sortOrder: nextSortOrder
    })
  }
  return {pageId: dbPageId}
}

export default updatePage
