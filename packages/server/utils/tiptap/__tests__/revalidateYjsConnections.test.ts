import type {afterLoadDocumentPayload, Document} from '@hocuspocus/server'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
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
const orgId = generateUID()
const teamId = generateUID()
const meetingId = generateUID()
const publisher = new RedisPublisher()

const makeConnection = (userId: string, readOnly = false) => {
  const iat = toEpochSeconds(new Date()) - 60
  return {
    context: {userId, iat, exp: iat + 3600, jti: generateUID(), connectedAt: Date.now()},
    readOnly,
    close: jest.fn(),
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
  publisher.meetingDocuments.clear()
})

afterAll(async () => {
  await pg.deleteFrom('NewMeeting').where('id', '=', meetingId).execute()
  await pg.deleteFrom('TeamMember').where('teamId', '=', teamId).execute()
  await pg.deleteFrom('Team').where('id', '=', teamId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
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
  const otherPageId = await makePage('editor')
  const owner = makeConnection(ownerId)
  const collaborator = makeConnection(collaboratorId)
  const collaboratorOnOtherPage = makeConnection(collaboratorId)
  openPage(pageId, [owner, collaborator])
  openPage(otherPageId, [collaboratorOnOtherPage])

  await pg
    .deleteFrom('PageUserAccess')
    .where('pageId', '=', pageId)
    .where('userId', '=', collaboratorId)
    .execute()
  await updatePageAccessTable(pg, pageId)
  await revalidateYjsConnections({pageTreeIds: [pageId]})
  await settle()

  expect(collaborator.close).toHaveBeenCalledWith({code: 4403, reason: 'AccessChanged'})
  expect(collaborator.webSocket.close).not.toHaveBeenCalled()
  expect(owner.close).not.toHaveBeenCalled()
  expect(collaboratorOnOtherPage.close).not.toHaveBeenCalled()
})

test('closes a connection whose role no longer matches its read-only state', async () => {
  const pageId = await makePage('viewer')
  const collaborator = makeConnection(collaboratorId, false)
  openPage(pageId, [collaborator])

  await revalidateYjsConnections({pageTreeIds: [pageId]})
  await settle()

  expect(collaborator.close).toHaveBeenCalledWith({code: 4403, reason: 'AccessChanged'})
  expect(collaborator.webSocket.close).not.toHaveBeenCalled()
})

test('closes every connection of a user whose sessions were invalidated', async () => {
  const pageId = await makePage('editor')
  const owner = makeConnection(ownerId)
  const collaborator = makeConnection(collaboratorId)
  openPage(pageId, [owner, collaborator])

  await blacklistJWT(collaboratorId, toEpochSeconds(new Date()) + 1)
  await settle()

  expect(collaborator.close).toHaveBeenCalledWith({code: 4403, reason: 'AccessChanged'})
  expect(collaborator.webSocket.close).not.toHaveBeenCalled()
  expect(owner.close).not.toHaveBeenCalled()
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

  expect(signedOut.close).toHaveBeenCalledWith({code: 4403, reason: 'AccessChanged'})
  expect(signedOut.webSocket.close).not.toHaveBeenCalled()
  expect(otherDevice.close).not.toHaveBeenCalled()
})

test('closes the meeting presence of a user removed from the team', async () => {
  await pg.insertInto('Organization').values({id: orgId, name: 'Revalidate Org'}).execute()
  await pg.insertInto('Team').values({id: teamId, name: 'Revalidate Team', orgId}).execute()
  await pg
    .insertInto('TeamMember')
    .values(
      [ownerId, collaboratorId].map((userId) => ({
        id: TeamMemberId.join(teamId, userId),
        teamId,
        userId
      }))
    )
    .execute()
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId,
      facilitatorStageId: 'stage1',
      meetingType: 'retrospective',
      name: 'Revalidate Meeting',
      meetingCount: 1,
      meetingNumber: 1,
      phases: JSON.stringify([])
    })
    .execute()
  const owner = makeConnection(ownerId, true)
  const collaborator = makeConnection(collaboratorId, true)
  await publisher.afterLoadDocument({
    documentName: `meeting:${meetingId}`,
    document: {getConnections: () => [owner, collaborator]}
  } as unknown as afterLoadDocumentPayload)

  await pg
    .updateTable('TeamMember')
    .set({isNotRemoved: false})
    .where('teamId', '=', teamId)
    .where('userId', '=', collaboratorId)
    .execute()
  await revalidateYjsConnections({userIds: [ownerId, collaboratorId]})
  await settle()

  expect(collaborator.close).toHaveBeenCalledWith({code: 4403, reason: 'AccessChanged'})
  expect(owner.close).not.toHaveBeenCalled()
})
