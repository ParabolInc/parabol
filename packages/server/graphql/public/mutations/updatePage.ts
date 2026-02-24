import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {redisHocusPocus} from '../../../hocusPocus'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import {getPageNextSortOrder} from './helpers/getPageNextSortOrder'
import {movePageToNewTeam} from './helpers/movePageToNewTeam'
import {movePageToTopLevel} from './helpers/movePageToTopLevel'
import {privatizePage} from './helpers/privatizePage'

export const MAX_PAGE_DEPTH = 10
const updatePage: MutationResolvers['updatePage'] = async (
  _source,
  {pageId, teamId, sortOrder, sourceSection, targetSection},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)
  const [dbPageId, pageCode] = CipherId.fromClient(pageId)
  if (sourceSection === 'private' && targetSection === 'shared') {
    throw new GraphQLError('Private pages cannot be moved direclty to shared')
  }
  if (targetSection === 'team' && !teamId) {
    throw new GraphQLError('teamId must be non-null if targetSection is team')
  }
  const page = await dataLoader.get('pages').load(dbPageId)
  dataLoader.get('pages').clearAll()
  if (!page) throw new GraphQLError('Invalid pageId')

  const isReorder =
    sourceSection === targetSection && ((!teamId && !page.teamId) || teamId === page.teamId)
  if (!isReorder) {
    if (page.isMeetingTOC) {
      throw new GraphQLError('Meeting Summaries pages cannot be moved')
    }
    // changing parents will change permissions.
    const userRole = await dataLoader
      .get('pageAccessByPageIdUserId')
      .load({pageId: dbPageId, userId: viewerId})
    dataLoader.get('pageAccessByPageIdUserId').clearAll()
    if (userRole !== 'owner') {
      throw new GraphQLError('You must be an owner to move the page to a different parent')
    }
  }

  // sortOrder is only used for pages without a parentPageId, or shared pages
  // else, the sortOrder is determined by the parent's order of canonical page links
  const nextSortOrder = await getPageNextSortOrder(
    sortOrder,
    targetSection === 'shared',
    viewerId,
    page.isPrivate,
    teamId || null
  )
  const pg = getKysely()
  if (sourceSection === targetSection) {
    if (targetSection === 'team' && page.teamId !== teamId) {
      // move from team A to team B
      await movePageToNewTeam(viewerId, dbPageId, teamId!, nextSortOrder)
    } else {
      // simple reorder
      if (targetSection === 'shared') {
        await pg
          .insertInto('PageUserSortOrder')
          .values({
            userId: viewerId,
            pageId: dbPageId,
            sortOrder: nextSortOrder
          })
          .onConflict((oc) =>
            oc.columns(['userId', 'pageId']).doUpdateSet({
              sortOrder: nextSortOrder
            })
          )
          .execute()
      } else {
        await pg
          .updateTable('Page')
          .set({sortOrder: nextSortOrder})
          .where('id', '=', dbPageId)
          .execute()
      }
    }
  } else {
    // moving from 1 section to another
    if (targetSection === 'private') {
      if (sourceSection !== 'private') {
        await privatizePage(viewerId, dbPageId, nextSortOrder)
      } else {
        throw new GraphQLError('Page is already private')
      }
    } else if (targetSection === 'shared') {
      if (!page.isPrivate) {
        // private pages cannot be moved to shared
        await movePageToTopLevel(viewerId, dbPageId, nextSortOrder)
      } else {
        throw new GraphQLError('Private page cannot be moved to shared')
      }
    } else if (targetSection === 'team') {
      // moving to a team
      await movePageToNewTeam(viewerId, dbPageId, teamId!, nextSortOrder)
    } else {
      throw new GraphQLError('Target must be private, shared, or team.')
    }
  }

  if (page.parentPageId) {
    // if it had a parent, ensure the canonical page link was removed from the old parent.
    // This may get called from the client for faster UI updates, but we call it here for posterity
    const {parentPageId: oldParentpageId} = page
    const documentName = CipherId.toClient(oldParentpageId, 'page')
    redisHocusPocus.handleEvent('removeCanonicalPageLinkFromPage', documentName, {pageCode})
  }
  const data = {pageId: dbPageId}
  const access = await dataLoader.get('pageAccessByPageId').load(dbPageId)
  access.forEach(({userId}) => {
    publish(SubscriptionChannel.NOTIFICATION, userId, 'UpdatePagePayload', data, subOptions)
  })
  return data
}

export default updatePage
