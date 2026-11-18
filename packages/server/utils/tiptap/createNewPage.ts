import {TiptapTransformer} from '@hocuspocus/transformer'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {encodeStateAsUpdate} from 'yjs'
import {__START__} from '../../../client/shared/sortOrder'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import {getPageNextSortOrder} from '../../graphql/public/mutations/helpers/getPageNextSortOrder'
import getKysely from '../../postgres/getKysely'
import {insertNewPageAccess} from '../../postgres/insertNewPageAccess'
import {updatePageAccessTable} from '../../postgres/updatePageAccessTable'
import {publishPageNotification} from '../publishPageNotification'
import {getPlaintextFromTipTap} from './getPlaintextFromTipTap'
import {validateParentPage} from './validateParentPage'

type CreateNewPageOptions = {
  parentPageId?: number
  isDatabase?: boolean
  isSyncedBlock?: boolean
  isMeetingTOC?: boolean
  content: TipTapSerializedPageContent
  teamId?: string | null
  summaryMeetingId?: string | null
  userId: string
}

export const createNewPage = async (options: CreateNewPageOptions, mutatorId?: string | null) => {
  const {
    content,
    parentPageId,
    isDatabase,
    isSyncedBlock,
    isMeetingTOC,
    teamId,
    summaryMeetingId,
    userId
  } = options

  const pg = getKysely()
  const yDoc = Buffer.from(
    encodeStateAsUpdate(TiptapTransformer.toYdoc(content, undefined, serverTipTapExtensions))
  )
  const {plaintextContent, title} = getPlaintextFromTipTap(content)

  let isPrivate: boolean = !teamId
  let ancestorIds: number[] = []
  let sortOrder: string = ''

  if (parentPageId) {
    const parentPage = await validateParentPage(parentPageId, userId, 'viewer')
    isPrivate = parentPage.isPrivate
    ancestorIds = parentPage.ancestorIds.concat(parentPageId)
  } else {
    sortOrder = await getPageNextSortOrder(__START__, false, userId, isPrivate, teamId ?? null)
  }

  const page = await pg
    .insertInto('Page')
    .values({
      userId,
      isPrivate,
      sortOrder,
      yDoc,
      plaintextContent,
      title,
      parentPageId,
      ancestorIds,
      isDatabase,
      isSyncedBlock,
      isMeetingTOC,
      summaryMeetingId,
      teamId
    })
    .returningAll()
    .executeTakeFirstOrThrow()
  const {id: pageId} = page

  await insertNewPageAccess(pg, {pageIds: [pageId], ownerId: userId, parentPageId, teamId})
  const dataLoader = getNewDataLoader('createNewPage')
  const operationId = dataLoader.share()
  await updatePageAccessTable(pg, pageId, {skipDeleteOld: true})

  const subOptions = {mutatorId: mutatorId ?? undefined, operationId}
  const data = {page}
  if (!isSyncedBlock) {
    await publishPageNotification(pageId, 'CreatePagePayload', data, subOptions, dataLoader)
  }
  dataLoader.dispose()
  return page
}
