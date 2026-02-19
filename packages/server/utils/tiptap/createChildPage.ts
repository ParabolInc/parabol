import {TiptapTransformer} from '@hocuspocus/transformer'
import {encodeStateAsUpdate} from 'yjs'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import getKysely from '../../postgres/getKysely'
import {updatePageAccessTable} from '../../postgres/updatePageAccessTable'
import {analytics} from '../../utils/analytics/analytics'
import {publishPageNotification} from '../publishPageNotification'
import {getPlaintextFromTipTap} from './getPlaintextFromTipTap'
import {validateParentPage} from './validateParentPage'

export const createChildPage = async (
  parentPageId: number,
  userId: string,
  isDatabase: boolean,
  title?: string
) => {
  const pg = getKysely()
  const parentPageWithRole = await validateParentPage(parentPageId, userId, 'viewer')
  const {isPrivate, ancestorIds} = parentPageWithRole

  const content = title
    ? {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: {level: 1},
            content: [{type: 'text', text: title}]
          }
        ]
      }
    : undefined

  const yDoc = content
    ? Buffer.from(
        encodeStateAsUpdate(TiptapTransformer.toYdoc(content, undefined, serverTipTapExtensions))
      )
    : undefined
  const contentRes = content ? getPlaintextFromTipTap(content) : {}

  const page = await pg
    .insertInto('Page')
    .values({
      userId,
      parentPageId,
      isPrivate,
      ancestorIds: ancestorIds.concat(parentPageId),
      sortOrder: '',
      isDatabase,
      yDoc,
      ...contentRes,
      title
    })
    .returningAll()
    .executeTakeFirstOrThrow()
  const {id: pageId} = page

  const [viewer] = await Promise.all([
    pg.selectFrom('User').selectAll().where('id', '=', userId).executeTakeFirstOrThrow(),
    pg.insertInto('PageUserAccess').values({userId, pageId, role: 'owner'}).execute(),
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
  ])
  await updatePageAccessTable(pg, pageId, {skipDeleteOld: true})
  analytics.pageCreated(viewer, pageId)
  const dataLoader = getNewDataLoader('createChildPage')
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId: undefined}
  const data = {page}
  await publishPageNotification(pageId, 'CreatePagePayload', data, subOptions, dataLoader)
  dataLoader.dispose()
  return page
}
