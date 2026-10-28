import type {Document} from '@hocuspocus/server'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../postgres/updatePageAccessTable'
import {blacklistJWT, blacklistJWTSession} from '../../blacklistJWT'
import {toEpochSeconds} from '../../epochTime'
import {getBlacklistJWTKey} from '../../getBlacklistJWTKey'
import getPubSub from '../../getPubSub'
import getRedis from '../../getRedis'
import {RedisPublisher} from '../hocusPocusRedisPublisher'
import {revalidateYjsConnections} from '../revalidateYjsConnections'

const pg = getKysely()
const ownerId = `revalidateOwner|${generateUID()}`
const collaboratorId = `revalidateCollaborator|${generateUID()}`
const publisher = new RedisPublisher()

const makeConnection = (userId: string, readOnly = false) => {
  const iat = toEpochSeconds(new Date()) - 60
  return {
    context: {userId, iat, exp: iat + 3600, jti: generateUID(), connectedAt: Date.now()},
    readOnly,
    webSocket: {close: jest.fn()}
  }
}

const openPage = (pageId: number, connections: ReturnType<typeof makeConnection>[]) => {
  const document = {getConnections: () => connections} as unknown as Document
  publisher.documentConnections.set(`publicPage:${pageId}`, document)
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 300))

const makePage = async (collaboratorRole: 'editor' | 'viewer') => {
  const {id: pageId} = await pg
    .insertInto('Page')
    .values({userId: ownerId, sortOrder: ''})
    .returning('id')
    .executeTakeFirstOrThrow()
  await pg
    .insertInto('PageUserAccess')
    .values([
      {pageId, userId: ownerId, role: 'owner'},
      {pageId, userId: collaboratorId, role: collaboratorRole}
    ])
    .execute()
  await updatePageAccessTable(pg, pageId)
  return pageId
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values(
      [ownerId, collaboratorId].map((id) => ({
        id,
        email: `${id}@example.com`,
        picture: 'https://example.com/pic.png',
        preferredName: id
      }))
    )
    .execute()
  await settle()
})

afterEach(() => {
  publisher.documentConnections.clear()
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', '=', ownerId).execute()
  await pg.deleteFrom('User').where('id', 'in', [ownerId, collaboratorId]).execute()
  const pubSub = getPubSub()
  pubSub.destroy()
  await Promise.all([
    publisher.sub.quit(),
    pubSub.publisher.quit(),
    pubSub.subscriber.quit(),
    getRedis().quit()
  ])
  await pg.destroy()
})

test('closes a connection whose page access was removed and keeps the others open', async () => {
  const pageId = await makePage('editor')
  const owner = makeConnection(ownerId)
  const collaborator = makeConnection(collaboratorId)
  openPage(pageId, [owner, collaborator])

  await pg
    .deleteFrom('PageUserAccess')
    .where('pageId', '=', pageId)
    .where('userId', '=', collaboratorId)
    .execute()
  await updatePageAccessTable(pg, pageId)
  await revalidateYjsConnections({pageTreeIds: [pageId]})
  await settle()

  expect(collaborator.webSocket.close).toHaveBeenCalled()
  expect(owner.webSocket.close).not.toHaveBeenCalled()
})

test('closes a connection whose role no longer matches its read-only state', async () => {
  const pageId = await makePage('viewer')
  const collaborator = makeConnection(collaboratorId, false)
  openPage(pageId, [collaborator])

  await revalidateYjsConnections({pageTreeIds: [pageId]})
  await settle()

  expect(collaborator.webSocket.close).toHaveBeenCalled()
})

test('closes every connection of a user whose sessions were invalidated', async () => {
  const pageId = await makePage('editor')
  const owner = makeConnection(ownerId)
  const collaborator = makeConnection(collaboratorId)
  openPage(pageId, [owner, collaborator])

  await blacklistJWT(collaboratorId, toEpochSeconds(new Date()) + 1)
  await settle()

  expect(collaborator.webSocket.close).toHaveBeenCalled()
  expect(owner.webSocket.close).not.toHaveBeenCalled()
})

test('closes only the connection of the session that signed out', async () => {
  await getRedis().del(getBlacklistJWTKey(collaboratorId))
  const pageId = await makePage('editor')
  const signedOut = makeConnection(collaboratorId)
  const otherDevice = makeConnection(collaboratorId)
  openPage(pageId, [signedOut, otherDevice])

  await blacklistJWTSession(signedOut.context.jti, toEpochSeconds(new Date()) + 3600)
  await revalidateYjsConnections({userIds: [collaboratorId]})
  await settle()

  expect(signedOut.webSocket.close).toHaveBeenCalled()
  expect(otherDevice.webSocket.close).not.toHaveBeenCalled()
})
