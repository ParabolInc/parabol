import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import publish from '../../../utils/publish'
import {removeCanonicalPageLinkFromPage} from '../../../utils/tiptap/removeCanonicalPageLinkFromPage'
import {MutationResolvers} from '../resolverTypes'
import {getPageNextSortOrder} from './helpers/getPageNextSortOrder'
import {movePageToNewTeam} from './helpers/movePageToNewTeam'
import {movePageToTopLevel} from './helpers/movePageToTopLevel'
import {privatizePage} from './helpers/privatizePage'

export const MAX_PAGE_DEPTH = 10
const updatePage: MutationResolvers['updatePage'] = async (
  _source,
  {pageId, teamId, sortOrder, makePrivate},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)
  const [dbPageId] = CipherId.fromClient(pageId)
  if (makePrivate && teamId) {
    throw new GraphQLError('makePrivate can only be true if teamId is null')
  }

  const page = await dataLoader.get('pages').load(dbPageId)
  dataLoader.get('pages').clearAll()
  if (!page) throw new GraphQLError('Invalid pageId')
  const hasChangedParent = page.teamId !== teamId || page.parentPageId !== null
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

  // sortOrder is only used for pages without a parentPageId
  // else, the sortOrder is determined by the parent's order of canonical page links
  const nextSortOrder = await getPageNextSortOrder(
    sortOrder,
    viewerId,
    page.isPrivate,
    teamId || null
  )
  const pg = getKysely()
  if (makePrivate && !page.isPrivate) {
    await privatizePage(viewerId, dbPageId, nextSortOrder)
  } else if (teamId && teamId !== page.teamId) {
    await movePageToNewTeam(viewerId, dbPageId, teamId, nextSortOrder)
  } else if (teamId === page.teamId && !page.parentPageId) {
    // simple reorder
    await pg
      .updateTable('Page')
      .set({sortOrder: nextSortOrder})
      .where('id', '=', dbPageId)
      .execute()
  } else if (!teamId) {
    await movePageToTopLevel(viewerId, dbPageId, nextSortOrder)
  } else {
    throw new GraphQLError('No page update could be performed')
  }

  if (page.parentPageId) {
    // if it had a parent, ensure the canonical page link was removed from the old parent.
    // This SHOULD get called from the client, so we delay it to give the client a chance to do the right thing
    const {parentPageId: oldParentpageId} = page
    setTimeout(() => {
      removeCanonicalPageLinkFromPage(oldParentpageId, dbPageId)
    }, 5000)
  }
  const data = {pageId: dbPageId}
  const access = await dataLoader.get('pageAccessByPageId').load(dbPageId)
  access.forEach(({userId}) => {
    publish(SubscriptionChannel.NOTIFICATION, userId, 'UpdatePagePayload', data, subOptions)
  })
  return data
}

export default updatePage
