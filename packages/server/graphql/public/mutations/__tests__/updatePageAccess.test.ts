import type {GraphQLResolveInfo} from 'graphql'
import {getNewDataLoader} from '../../../../dataloader/getNewDataLoader'
import generateUID from '../../../../generateUID'
import getKysely from '../../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../../postgres/updatePageAccessTable'
import {CipherId} from '../../../../utils/CipherId'
import type {GQLContext} from '../../../graphql'
import updatePageAccess from '../updatePageAccess'

const mockSendEmail = jest.fn(async () => true)
jest.mock('../../../../email/getMailManager', () => ({
  __esModule: true,
  default: () => ({sendEmail: mockSendEmail})
}))
jest.mock('../../../../utils/tiptap/revalidateYjsConnections', () => ({
  revalidateYjsConnections: async () => {}
}))
jest.mock('../../../../utils/publishPageNotification', () => ({
  publishPageNotification: async () => {}
}))

const pg = getKysely()
const ownerId = `updatePageAccess|${generateUID()}`
const info = {} as GraphQLResolveInfo

const resolve = updatePageAccess
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const makePage = async () => {
  const {id} = await pg
    .insertInto('Page')
    .values({userId: ownerId, sortOrder: ''})
    .returning('id')
    .executeTakeFirstOrThrow()
  await pg
    .insertInto('PageUserAccess')
    .values({pageId: id, userId: ownerId, role: 'owner'})
    .execute()
  await updatePageAccessTable(pg, id, {skipDeleteOld: true})
  return id
}

const shareExternally = (pageId: number, subjectId: string) => {
  const dataLoader = getNewDataLoader('updatePageAccess.test')
  const context = {authToken: {sub: ownerId}, dataLoader, socketId: 'socket1'} as GQLContext
  return resolve(
    {},
    {
      pageId: CipherId.toClient(pageId, 'page'),
      subjectType: 'external',
      subjectId,
      role: 'viewer'
    },
    context,
    info
  )
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values({
      id: ownerId,
      email: `${ownerId}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'Page Owner'
    })
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', '=', ownerId).execute()
  await pg.deleteFrom('User').where('id', '=', ownerId).execute()
  await pg.destroy()
})

test('sharing the public link sends no invitation', async () => {
  const pageId = await makePage()

  await shareExternally(pageId, '*')

  const publicAccess = await pg
    .selectFrom('PageExternalAccess')
    .select('role')
    .where('pageId', '=', pageId)
    .where('email', '=', '*')
    .executeTakeFirst()
  expect(publicAccess?.role).toBe('viewer')
  expect(mockSendEmail).not.toHaveBeenCalled()
}, 30_000)

test('sharing with an email address that has no account sends it an invitation', async () => {
  const pageId = await makePage()
  const inviteeEmail = `invitee-${generateUID().toLowerCase()}@example.com`

  await shareExternally(pageId, inviteeEmail)

  expect(mockSendEmail).toHaveBeenCalledTimes(1)
  expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({to: inviteeEmail}))
}, 30_000)
