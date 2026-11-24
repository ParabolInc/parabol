import {Editor, type JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {redisHocusPocus} from '../../../hocusPocus'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import publish from '../../../utils/publish'
import {getPageContent} from '../../../utils/tiptap/getPageContent'
import {parsePageMarkdown} from '../../../utils/tiptap/parsePageMarkdown'
import {collectImageSrcs, validatePageDoc} from '../../../utils/tiptap/validatePageDoc'
import type {MutationResolvers} from '../resolverTypes'

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

  const currentContent: JSONContent = JSON.parse(await getPageContent(dbPageId, 'json', dataLoader))
  const allowedImageSrcs = new Set(collectImageSrcs(currentContent.content ?? []))
  const editor = new Editor({
    element: undefined,
    content: {type: 'doc', content: [{type: 'paragraph'}]},
    extensions: serverTipTapExtensions
  })
  let jsonContent: JSONContent
  try {
    if (format === 'markdown') {
      jsonContent = {
        type: 'doc',
        content: parsePageMarkdown(editor, content, allowedImageSrcs)
      }
    } else {
      try {
        jsonContent = JSON.parse(content)
      } catch {
        throw new GraphQLError('Invalid JSON content', {extensions: {code: 'BAD_USER_INPUT'}})
      }
      validatePageDoc(editor, jsonContent, allowedImageSrcs)
    }
  } finally {
    editor.destroy()
  }

  const documentName = CipherId.toClient(dbPageId, 'page')
  await redisHocusPocus.handleEvent('replacePageContent', documentName, {
    content: jsonContent,
    userId: viewerId,
    resourceGrants: resourceGrants?.serialize(),
    scopes: authToken.scope
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
