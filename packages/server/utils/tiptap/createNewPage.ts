import {TiptapTransformer} from '@hocuspocus/transformer'
import type {TipTapSerializedContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {encodeStateAsUpdate} from 'yjs'
import {__START__} from '../../../client/shared/sortOrder'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import type {DataLoaderWorker} from '../../graphql/graphql'
import {getPageNextSortOrder} from '../../graphql/public/mutations/helpers/getPageNextSortOrder'
import getKysely from '../../postgres/getKysely'
import {updatePageAccessTable} from '../../postgres/updatePageAccessTable'
import {analytics} from '../../utils/analytics/analytics'
import {publishPageNotification} from '../publishPageNotification'
import {getPlaintextFromTipTap} from './getPlaintextFromTipTap'
import {validateParentPage} from './validateParentPage'

type CreateNewPageOptions = {
  parentPageId?: number
  isDatabase?: boolean
  content: TipTapSerializedContent
  teamId?: string | null
  summaryMeetingId?: string | null
  userId: string
}

export const createNewPage = async (
  options: CreateNewPageOptions,
  existingDataLoader?: DataLoaderWorker,
  mutatorId?: string | null
) => {
  const {content, parentPageId, isDatabase, teamId, summaryMeetingId, userId} = options

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
      summaryMeetingId,
      teamId
    })
    .returningAll()
    .executeTakeFirstOrThrow()
  const {id: pageId} = page

  const ownerInsert = pg
    .insertInto('PageUserAccess')
    .values({userId, pageId, role: 'owner'})
    .execute()

  const accessInserts: Promise<unknown>[] = [ownerInsert]

  if (parentPageId) {
    accessInserts.push(
      pg
        .insertInto('PageUserAccess')
        .columns(['userId', 'pageId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('PageUserAccess')
            .select((eb) => ['userId', eb.val(pageId).as('pageId'), 'role'])
            .where('pageId', '=', parentPageId)
            .where('userId', '!=', userId)
        )
        .execute(),
      pg
        .insertInto('PageTeamAccess')
        .columns(['teamId', 'pageId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('PageTeamAccess')
            .select((eb) => ['teamId', eb.val(pageId).as('pageId'), 'role'])
            .where('pageId', '=', parentPageId)
        )
        .execute(),
      pg
        .insertInto('PageOrganizationAccess')
        .columns(['orgId', 'pageId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('PageOrganizationAccess')
            .select((eb) => ['orgId', eb.val(pageId).as('pageId'), 'role'])
            .where('pageId', '=', parentPageId)
        )
        .execute(),
      pg
        .insertInto('PageExternalAccess')
        .columns(['email', 'pageId', 'role', 'invitedBy'])
        .expression((eb) =>
          eb
            .selectFrom('PageExternalAccess')
            .select((eb) => ['email', eb.val(pageId).as('pageId'), 'role', 'invitedBy'])
            .where('pageId', '=', parentPageId)
        )
        .execute()
    )
  } else if (teamId) {
    accessInserts.push(
      pg.insertInto('PageTeamAccess').values({teamId, pageId, role: 'editor'}).execute()
    )
  }

  const dataLoader = existingDataLoader ?? getNewDataLoader('createNewPage')
  const operationId = dataLoader.share()
  const [viewer] = await Promise.all([
    dataLoader.get('users').loadNonNull(userId),
    ...accessInserts
  ])

  await updatePageAccessTable(pg, pageId, {skipDeleteOld: true})
  analytics.pageCreated(viewer, pageId)

  const subOptions = {mutatorId: mutatorId ?? undefined, operationId}
  const data = {page}
  await publishPageNotification(pageId, 'CreatePagePayload', data, subOptions, dataLoader)
  if (!existingDataLoader) dataLoader.dispose()
  return page
}
