import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {getSyncedBlockBody} from '../../../../client/shared/tiptap/getSyncedBlockBody'
import {redisHocusPocus} from '../../../hocusPocus'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {Logger} from '../../../utils/Logger'
import {publishPageNotification} from '../../../utils/publishPageNotification'
import {selectUnsyncOutcomes} from '../../../utils/tiptap/selectUnsyncOutcomes'
import type {MutationResolvers} from '../resolverTypes'

const alreadyInTrash = () =>
  new GraphQLError('This synced block is already in Trash', {extensions: {code: 'CONFLICT'}})

const unsyncSyncedBlock: MutationResolvers['unsyncSyncedBlock'] = async (
  _source,
  {pageId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)
  const [blockId, pageCode] = CipherId.fromClient(pageId)
  const block = await dataLoader.get('pages').load(blockId)
  if (!block?.isSyncedBlock) {
    throw new GraphQLError('Not a synced block', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  if (block.deletedAt) throw alreadyInTrash()
  const blockContent = await redisHocusPocus.handleEvent(
    'readPageContent',
    CipherId.toClient(blockId, 'page'),
    {}
  )
  const body = getSyncedBlockBody(blockContent!)
  const hostIds = (
    await pg
      .selectFrom('PageBacklink')
      .select('fromPageId')
      .where('toPageId', '=', blockId)
      .where('fromPageId', '!=', blockId)
      .execute()
  ).map(({fromPageId}) => fromPageId)
  const outcomes = await selectUnsyncOutcomes(pg, blockId, hostIds)
  const {numUpdatedRows} = await pg
    .updateTable('Page')
    .set({deletedAt: sql`CURRENT_TIMESTAMP`, deletedBy: viewerId})
    .where('id', '=', blockId)
    .where('deletedAt', 'is', null)
    .executeTakeFirst()
  if (numUpdatedRows === 0n) throw alreadyInTrash()
  dataLoader.get('pages').clear(blockId)
  const replacements = await Promise.allSettled(
    hostIds.map((hostId) => {
      const outcome = outcomes.get(hostId)
      const keeps = outcome?.hiddenReaderCount === 0 && !outcome.isPublicWithoutBlock
      return redisHocusPocus.handleEvent(
        'replaceSyncedBlockWithContent',
        CipherId.toClient(hostId, 'page'),
        {pageCode, content: keeps ? body : null}
      )
    })
  )
  replacements.forEach((result) => {
    if (result.status === 'rejected') Logger.error(result.reason)
  })
  await publishPageNotification(
    blockId,
    'ArchivePagePayload',
    {pageId: blockId, action: 'archive'},
    subOptions,
    dataLoader
  )
  return {pageId: blockId}
}

export default unsyncSyncedBlock
