import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../postgres/updatePageAccessTable'
import {blacklistJWT, blacklistJWTSession} from '../../blacklistJWT'
import {CipherId} from '../../CipherId'
import {toEpochSeconds} from '../../epochTime'
import getPubSub from '../../getPubSub'
import getRedis from '../../getRedis'
import {authenticateYjsConnection} from '../authenticateYjsConnection'

const pg = getKysely()
const ownerId = `authOwner|${generateUID()}`
const viewerId = `authViewer|${generateUID()}`

const authenticate = async (
  documentName: string,
  userId: string,
  session: {jti?: string; connectedAt?: number} = {}
) => {
  const iat = toEpochSeconds(new Date()) - 60
  const connectionConfig = {readOnly: false, isAuthenticated: false}
  await authenticateYjsConnection({
    documentName,
    context: {userId, iat, exp: iat + 3600, ...session},
    connectionConfig
  })
  return connectionConfig
}

let pageId: number

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values(
      [ownerId, viewerId].map((id) => ({
        id,
        email: `${id}@example.com`,
        picture: 'https://example.com/pic.png',
        preferredName: id
      }))
    )
    .execute()
  const page = await pg
    .insertInto('Page')
    .values({userId: ownerId, sortOrder: ''})
    .returning('id')
    .executeTakeFirstOrThrow()
  pageId = page.id
  await pg
    .insertInto('PageUserAccess')
    .values([
      {pageId, userId: ownerId, role: 'owner'},
      {pageId, userId: viewerId, role: 'viewer'}
    ])
    .execute()
  await updatePageAccessTable(pg, pageId)
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', '=', ownerId).execute()
  await pg.deleteFrom('User').where('id', 'in', [ownerId, viewerId]).execute()
  const pubSub = getPubSub()
  pubSub.destroy()
  await Promise.all([pubSub.publisher.quit(), pubSub.subscriber.quit(), getRedis().quit()])
  await pg.destroy()
})

test('opens the canonical page document with the role the user has', async () => {
  const documentName = CipherId.toClient(pageId, 'page')
  expect(await authenticate(documentName, ownerId)).toMatchObject({readOnly: false})
  expect(await authenticate(documentName, viewerId)).toMatchObject({readOnly: true})
})

test('rejects other names that resolve to the same page', async () => {
  const pageCode = CipherId.encrypt(pageId)
  for (const alias of [`doc:${pageCode}`, `page:0${pageCode}`, `page:${pageCode}:x`]) {
    await expect(authenticate(alias, ownerId)).rejects.toMatchObject({reason: 'InvalidDocument'})
  }
})

test('rejects a session that signed out', async () => {
  const jti = generateUID()
  await blacklistJWTSession(jti, toEpochSeconds(new Date()) + 3600)
  await expect(
    authenticate(CipherId.toClient(pageId, 'page'), ownerId, {jti, connectedAt: Date.now() - 1000})
  ).rejects.toMatchObject({reason: 'Unauthenticated'})
})

test('keeps a refreshed session working only on sockets opened before the refresh', async () => {
  const jti = generateUID()
  const refreshedAt = Date.now()
  await blacklistJWTSession(jti, toEpochSeconds(new Date()) + 3600, refreshedAt)
  const documentName = CipherId.toClient(pageId, 'page')
  expect(
    await authenticate(documentName, ownerId, {jti, connectedAt: refreshedAt - 1000})
  ).toMatchObject({readOnly: false})
  await expect(
    authenticate(documentName, ownerId, {jti, connectedAt: refreshedAt + 1000})
  ).rejects.toMatchObject({reason: 'Unauthenticated'})
})

test('rejects a session that was invalidated after the socket opened', async () => {
  await blacklistJWT(viewerId, toEpochSeconds(new Date()) + 1)
  await expect(authenticate(CipherId.toClient(pageId, 'page'), viewerId)).rejects.toMatchObject({
    reason: 'Unauthenticated'
  })
})
