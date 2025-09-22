import {sql} from 'kysely'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import getKysely from '../../postgres/getKysely'
import {updatePageAccessTable} from '../../postgres/updatePageAccessTable'
import {analytics} from '../../utils/analytics/analytics'
import {publishPageNotification} from '../publishPageNotification'
import {validateParentPage} from './validateParentPage'

export const createChildPage = async (parentPageId: number, userId: string) => {
  const pg = getKysely()
  const parentPageWithRole = await validateParentPage(parentPageId, userId, 'viewer')
  const {isPrivate, ancestorIds} = parentPageWithRole
  const page = await pg
    .insertInto('Page')
    .values({
      userId,
      parentPageId,
      isPrivate,
      ancestorIds: ancestorIds.concat(parentPageId),
      sortOrder: ''
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
      .columns(['email', 'pageId', 'role'])
      .expression((eb) =>
        eb
          .selectFrom('PageExternalAccess')
          .select((eb) => ['email', eb.val(pageId).as('pageId'), 'role'])
          .where('pageId', '=', parentPageId)
      )
      .execute()
  ])
  await updatePageAccessTable(pg, pageId, {skipDeleteOld: true})
    .selectNoFrom(sql`1`.as('t'))
    .execute()
  analytics.pageCreated(viewer, pageId)
  const dataLoader = getNewDataLoader('createChildPage')
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId: undefined}
  const data = {page}
  await publishPageNotification(pageId, 'CreatePagePayload', data, subOptions, dataLoader)
  dataLoader.dispose()
  return page
}
