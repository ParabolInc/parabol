import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {publishPageThreadNotification} from '../../../utils/publishPageThreadNotification'
import type {MutationResolvers} from '../resolverTypes'

const updatePageThread: MutationResolvers['updatePageThread'] = async (
  _source,
  {threadId, isResolved},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const [dbThreadId] = CipherId.fromClient(threadId)

  // RESOLUTION
  await getKysely()
    .updateTable('PageThread')
    .set({resolvedAt: isResolved ? new Date() : null, resolvedBy: isResolved ? viewerId : null})
    .where('id', '=', dbThreadId)
    .where('resolvedAt', isResolved ? 'is' : 'is not', null)
    .execute()
  dataLoader.clearAll('pageThreads')
  const thread = await dataLoader.get('pageThreads').loadNonNull(dbThreadId)
  const data = {threadId: dbThreadId}
  await publishPageThreadNotification(
    thread.pageId,
    'UpdatePageThreadSuccess',
    data,
    subOptions,
    dataLoader
  )
  return data
}

export default updatePageThread
