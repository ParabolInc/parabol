import {GraphQLError} from 'graphql'
import {redisHocusPocus} from '../../../hocusPocus'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {publishPageThreadNotification} from '../../../utils/publishPageThreadNotification'
import type {MutationResolvers} from '../resolverTypes'
import {parsePageCommentContent} from './helpers/parsePageCommentContent'

const addPageComment: MutationResolvers['addPageComment'] = async (
  _source,
  {pageId, content: serializedContent, threadId, anchor},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()
  const [dbPageId] = CipherId.fromClient(pageId)

  // VALIDATION
  if (!threadId === !anchor) {
    throw new GraphQLError('Provide a threadId to reply or an anchor to start a thread')
  }
  const {content, plaintextContent} = parsePageCommentContent(serializedContent)
  const comment = {content, plaintextContent, createdBy: viewerId}

  // RESOLUTION
  if (threadId) {
    const [dbThreadId] = CipherId.fromClient(threadId)
    const thread = await dataLoader.get('pageThreads').load(dbThreadId)
    if (thread?.pageId !== dbPageId) throw new GraphQLError('Thread not found')
    const {id: commentId} = await pg
      .insertInto('PageComment')
      .values({...comment, threadId: dbThreadId})
      .returning('id')
      .executeTakeFirstOrThrow()
    const data = {commentId, threadId: dbThreadId}
    await publishPageThreadNotification(
      dbPageId,
      'AddPageCommentSuccess',
      data,
      subOptions,
      dataLoader
    )
    return data
  }

  // The mark is the only thing that ties the thread to the text, so a thread that can't be
  // marked is rolled back
  const data = await pg.transaction().execute(async (trx) => {
    const {id: dbThreadId} = await trx
      .insertInto('PageThread')
      .values({pageId: dbPageId})
      .returning('id')
      .executeTakeFirstOrThrow()
    const quote = await redisHocusPocus.handleEvent(
      'addPageThreadMark',
      CipherId.toClient(dbPageId, 'page'),
      {
        threadId: CipherId.toClient(dbThreadId, 'pageThread'),
        anchor: anchor!.anchor,
        head: anchor!.head
      }
    )
    if (!quote) throw new GraphQLError('The selected text is no longer on the page')
    await trx.updateTable('PageThread').set({quote}).where('id', '=', dbThreadId).execute()
    const {id: commentId} = await trx
      .insertInto('PageComment')
      .values({...comment, threadId: dbThreadId})
      .returning('id')
      .executeTakeFirstOrThrow()
    return {commentId, threadId: dbThreadId}
  })
  await publishPageThreadNotification(
    dbPageId,
    'AddPageCommentSuccess',
    data,
    subOptions,
    dataLoader
  )
  return data
}

export default addPageComment
