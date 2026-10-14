import {redisHocusPocus} from '../../../hocusPocus'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import logError from '../../../utils/logError'
import {publishPageThreadNotification} from '../../../utils/publishPageThreadNotification'
import type {MutationResolvers} from '../resolverTypes'

const deletePageComment: MutationResolvers['deletePageComment'] = async (
  _source,
  {commentId},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()
  const [dbCommentId] = CipherId.fromClient(commentId)
  const comment = await dataLoader.get('pageComments').loadNonNull(dbCommentId)
  const {threadId} = comment
  const [thread, threadComments] = await Promise.all([
    dataLoader.get('pageThreads').loadNonNull(threadId),
    dataLoader.get('pageCommentsByThreadId').load(threadId)
  ])
  const {pageId} = thread

  // RESOLUTION
  // a thread is the conversation its first comment started, so it does not outlive that comment
  const isThreadStarter = threadComments[0]?.id === dbCommentId
  if (isThreadStarter) {
    await pg.deleteFrom('PageThread').where('id', '=', threadId).execute()
    await redisHocusPocus
      .handleEvent('removePageThreadMark', CipherId.toClient(pageId, 'page'), {
        threadId: CipherId.toClient(threadId, 'pageThread')
      })
      .catch(logError)
  } else {
    await pg.deleteFrom('PageComment').where('id', '=', dbCommentId).execute()
  }
  dataLoader.clearAll(['pageComments', 'pageThreads'])
  const data = {comment, thread}
  await publishPageThreadNotification(
    pageId,
    'DeletePageCommentSuccess',
    data,
    subOptions,
    dataLoader
  )
  return data
}

export default deletePageComment
