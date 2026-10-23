import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import {publishPageThreadNotification} from '../../../utils/publishPageThreadNotification'
import type {MutationResolvers} from '../resolverTypes'
import {parsePageCommentContent} from './helpers/parsePageCommentContent'

const updatePageComment: MutationResolvers['updatePageComment'] = async (
  _source,
  {commentId, content: serializedContent},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const [dbCommentId] = CipherId.fromClient(commentId)

  // VALIDATION
  const {content, plaintextContent} = parsePageCommentContent(serializedContent)

  // RESOLUTION
  const {threadId} = await getKysely()
    .updateTable('PageComment')
    .set({content, plaintextContent})
    .where('id', '=', dbCommentId)
    .returning('threadId')
    .executeTakeFirstOrThrow()
  dataLoader.clearAll('pageComments')
  const thread = await dataLoader.get('pageThreads').loadNonNull(threadId)
  const data = {commentId: dbCommentId}
  await publishPageThreadNotification(
    thread.pageId,
    'UpdatePageCommentSuccess',
    data,
    subOptions,
    dataLoader
  )
  return data
}

export default updatePageComment
