import type {JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {redisHocusPocus} from '../../../hocusPocus'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import publish from '../../../utils/publish'
import {collectLinkedPageCodes} from '../../../utils/tiptap/assertReachablePageLinks'
import {parseMarkdownContent} from '../../../utils/tiptap/parsePageMarkdown'
import type {MutationResolvers} from '../resolverTypes'
import {getReachablePageCodes} from './helpers/getReachablePageCodes'

const editPageContent: MutationResolvers['editPageContent'] = async (
  _source,
  {pageId, content, format},
  {authToken, dataLoader, socketId: mutatorId, resourceGrants}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const [dbPageId] = CipherId.fromClient(pageId)

  const page = await dataLoader.get('pages').load(dbPageId)
  if (!page) throw new GraphQLError('Invalid pageId', {extensions: {code: 'BAD_USER_INPUT'}})
  if (page.isMeetingTOC)
    throw new GraphQLError('Meeting Summaries pages cannot be edited', {
      extensions: {code: 'BAD_USER_INPUT'}
    })

  let jsonContent: JSONContent
  if (format === 'markdown') {
    jsonContent = {
      type: 'doc',
      content: content.trim() ? parseMarkdownContent(content) : [{type: 'paragraph'}]
    }
  } else {
    try {
      jsonContent = JSON.parse(content)
    } catch {
      throw new GraphQLError('Invalid JSON content', {extensions: {code: 'BAD_USER_INPUT'}})
    }
  }

  const canChangePageLinks = !resourceGrants || resourceGrants.isUnrestricted()
  const reachablePageCodes = canChangePageLinks
    ? []
    : await getReachablePageCodes(collectLinkedPageCodes(jsonContent.content ?? []), resourceGrants)
  const documentName = CipherId.toClient(dbPageId, 'page')
  await redisHocusPocus.handleEvent('replacePageContent', documentName, {
    content: jsonContent,
    userId: viewerId,
    resourceGrants: resourceGrants?.serialize(),
    scopes: authToken.scope,
    canChangePageLinks,
    reachablePageCodes
  })

  dataLoader.get('pages').clearAll()
  const updatedPage = await dataLoader.get('pages').loadNonNull(dbPageId)

  const data = {pageId: dbPageId}
  const access = await dataLoader.get('pageAccessByPageId').load(dbPageId)
  access.forEach(({userId}) => {
    publish(SubscriptionChannel.NOTIFICATION, userId, 'UpdatePagePayload', data, subOptions)
  })
  return {page: updatedPage}
}

export default editPageContent
