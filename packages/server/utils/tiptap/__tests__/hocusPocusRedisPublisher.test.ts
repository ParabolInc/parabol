import type {afterLoadDocumentPayload} from '@hocuspocus/server'
import {YJS_ACCESS_CHANGED} from '../../../../client/shared/tiptap/yjsAccessChanged'
import {CipherId} from '../../CipherId'
import {getPageConnectionAccess} from '../getPageConnectionAccess'
import {RedisPublisher} from '../hocusPocusRedisPublisher'
import {YJS_REVALIDATE_CHANNEL} from '../revalidateYjsConnections'

type MessageHandler = (channel: Buffer, message: Buffer) => Promise<void>
const handlers: Record<string, MessageHandler> = {}

jest.mock('../../RedisInstance', () => ({
  __esModule: true,
  default: class {
    on(event: string, handler: MessageHandler) {
      handlers[event] = handler
    }
    subscribe() {
      return Promise.resolve()
    }
    unsubscribe() {
      return Promise.resolve()
    }
  }
}))
jest.mock('../getPageConnectionAccess')
jest.mock('../isYjsSessionLive', () => ({isYjsSessionLive: jest.fn().mockResolvedValue(true)}))

const mockedAccess = getPageConnectionAccess as jest.MockedFunction<typeof getPageConnectionAccess>

const hostId = 101
const blockId = 202

const makeConnection = (webSocket: {close: jest.Mock}) => ({
  context: {userId: 'u1'},
  readOnly: false,
  close: jest.fn(),
  webSocket
})

const setup = async () => {
  const sharedWebSocket = {close: jest.fn()}
  const hostConnection = makeConnection(sharedWebSocket)
  const blockConnection = makeConnection(sharedWebSocket)
  const publisher = new RedisPublisher()
  const register = (id: number, connection: ReturnType<typeof makeConnection>) =>
    publisher.afterLoadDocument({
      documentName: CipherId.toClient(id, 'page'),
      document: {getConnections: () => [connection]}
    } as unknown as afterLoadDocumentPayload)
  await register(hostId, hostConnection)
  await register(blockId, blockConnection)
  const revalidate = (payload: {pageIds: number[]; userIds: string[]}) =>
    handlers.messageBuffer!(
      Buffer.from(YJS_REVALIDATE_CHANNEL),
      Buffer.from(JSON.stringify(payload))
    )
  return {sharedWebSocket, hostConnection, blockConnection, revalidate}
}

test('closes only the documents whose access changed', async () => {
  const {sharedWebSocket, hostConnection, blockConnection, revalidate} = await setup()
  mockedAccess.mockResolvedValue(null)
  await revalidate({pageIds: [blockId], userIds: []})
  expect(blockConnection.close).toHaveBeenCalledWith({code: 4403, reason: YJS_ACCESS_CHANGED})
  expect(hostConnection.close).not.toHaveBeenCalled()
  expect(sharedWebSocket.close).not.toHaveBeenCalled()
})

test('closes a connection whose read-only flag changed', async () => {
  const {sharedWebSocket, hostConnection, blockConnection, revalidate} = await setup()
  mockedAccess.mockResolvedValue({readOnly: true})
  await revalidate({pageIds: [blockId], userIds: []})
  expect(blockConnection.close).toHaveBeenCalledTimes(1)
  expect(hostConnection.close).not.toHaveBeenCalled()
  expect(sharedWebSocket.close).not.toHaveBeenCalled()
})

test('leaves a connection whose access is unchanged', async () => {
  const {sharedWebSocket, hostConnection, blockConnection, revalidate} = await setup()
  mockedAccess.mockResolvedValue({readOnly: false})
  await revalidate({pageIds: [blockId], userIds: []})
  expect(blockConnection.close).not.toHaveBeenCalled()
  expect(hostConnection.close).not.toHaveBeenCalled()
  expect(sharedWebSocket.close).not.toHaveBeenCalled()
})

test('closes every document of a user named in userIds', async () => {
  const {sharedWebSocket, hostConnection, blockConnection, revalidate} = await setup()
  mockedAccess.mockResolvedValue(null)
  await revalidate({pageIds: [], userIds: ['u1']})
  expect(blockConnection.close).toHaveBeenCalledWith({code: 4403, reason: YJS_ACCESS_CHANGED})
  expect(hostConnection.close).toHaveBeenCalledWith({code: 4403, reason: YJS_ACCESS_CHANGED})
  expect(sharedWebSocket.close).not.toHaveBeenCalled()
})
