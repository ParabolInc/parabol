import type {GraphQLResolveInfo} from 'graphql'
import ms from 'ms'
import AuthToken from '../../../../database/types/AuthToken'
import {getNewDataLoader} from '../../../../dataloader/getNewDataLoader'
import generateUID from '../../../../generateUID'
import getKysely from '../../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../../postgres/updatePageAccessTable'
import {CipherId} from '../../../../utils/CipherId'
import type {GQLContext} from '../../../graphql'
import type {MutationRequestPageAccessArgs, ResolverFn} from '../../resolverTypes'
import requestPageAccess from '../requestPageAccess'

jest.mock('../../../../email/getMailManager', () => ({
  __esModule: true,
  default: () => ({sendEmail: async () => true})
}))
jest.mock('../helpers/publishNotification', () => ({__esModule: true, default: () => {}}))

const pg = getKysely()
const ownerId = `requestPageAccessOwner|${generateUID()}`
const requesterId = `requestPageAccessRequester|${generateUID()}`

const resolve = requestPageAccess as ResolverFn<
  boolean | null,
  {},
  Pick<GQLContext, 'authToken' | 'dataLoader' | 'socketId'>,
  MutationRequestPageAccessArgs
>

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values(
      [ownerId, requesterId].map((id) => ({
        id,
        email: `${id}@example.com`,
        picture: 'https://example.com/pic.png',
        preferredName: id
      }))
    )
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', '=', ownerId).execute()
  await pg.deleteFrom('User').where('id', 'in', [ownerId, requesterId]).execute()
  await pg.destroy()
})

test('a request for more than viewing a synced block asks only to view it, even when renewing an older request', async () => {
  const {id: pageId} = await pg
    .insertInto('Page')
    .values({userId: ownerId, sortOrder: '', isSyncedBlock: true})
    .returning('id')
    .executeTakeFirstOrThrow()
  await pg.insertInto('PageUserAccess').values({pageId, userId: ownerId, role: 'owner'}).execute()
  await updatePageAccessTable(pg, pageId, {skipDeleteOld: true})
  await pg
    .insertInto('PageAccessRequest')
    .values({
      pageId,
      userId: requesterId,
      role: 'owner',
      createdAt: new Date(Date.now() - ms('2d'))
    })
    .execute()
  const dataLoader = getNewDataLoader('requestPageAccess.test')
  const authToken = new AuthToken({sub: requesterId, tms: []})

  await resolve(
    {},
    {pageId: CipherId.toClient(pageId, 'page'), reason: '', role: 'owner'},
    {authToken, dataLoader, socketId: 'socket1'},
    {} as GraphQLResolveInfo
  )
  dataLoader.dispose()

  const request = await pg
    .selectFrom('PageAccessRequest')
    .select('role')
    .where('pageId', '=', pageId)
    .executeTakeFirstOrThrow()
  const notification = await pg
    .selectFrom('Notification')
    .select('role')
    .where('pageId', '=', pageId)
    .executeTakeFirstOrThrow()
  expect([request.role, notification.role]).toEqual(['viewer', 'viewer'])
}, 30_000)
