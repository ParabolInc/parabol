import {GraphQLError} from 'graphql'
import {markdownToTipTap} from '../../../../client/shared/tiptap/markdownToTipTap'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {redisHocusPocus} from '../../../hocusPocus'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const editPageContent: MutationResolvers['editPageContent'] = async (
  _source,
  {pageId, content, format},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const [dbPageId] = CipherId.fromClient(pageId)

  const page = await dataLoader.get('pages').load(dbPageId)
  if (!page) throw new GraphQLError('Invalid pageId')
  if (page.isMeetingTOC) throw new GraphQLError('Meeting Summaries pages cannot be edited')

  const jsonContent =
    format === 'markdown'
      ? {type: 'doc' as const, content: markdownToTipTap(content) as any[]}
      : (() => {
          try {
            return JSON.parse(content)
          } catch {
            throw new GraphQLError('Invalid JSON content')
          }
        })()

  const documentName = CipherId.toClient(dbPageId, 'page')
  await redisHocusPocus.handleEvent('replacePageContent', documentName, {
    content: jsonContent,
    userId: viewerId
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
