import {MessageType} from '@hocuspocus/server'
import * as decoding from 'lib0/decoding'
import * as encoding from 'lib0/encoding'
import ms from 'ms'
import {Logger} from '../../Logger'
import type {YjsContext} from '../authenticateYjsConnection'
import {SafeHocuspocus} from '../SafeHocuspocus'
import {throttleRefusedAuthentication} from '../throttleRefusedAuthentication'

// AuthMessageType in @hocuspocus/common
const TOKEN = 0
const PERMISSION_DENIED = 1

type AuthenticatePayload = {documentName: string; context: YjsContext}

const refuse = (reason: string) => Object.assign(new Error(`Refused: ${reason}`), {reason})

// Like authenticateYjsConnection: page:1 to page:999 exist and anything above is someone else's
const authenticate = jest.fn(async ({documentName, context}: AuthenticatePayload) => {
  if (context.isUnauthenticated) throw refuse('Unauthenticated')
  if (Number(documentName.split(':')[1]) >= 1000) throw refuse('Unauthorized')
  return {userId: context.userId}
})

const openSocket = (hocuspocus: SafeHocuspocus<YjsContext>, context: YjsContext) => {
  const authReplies: {documentName: string; reason?: string}[] = []
  const websocket = {
    readyState: 1,
    close: () => {},
    send: (message: Uint8Array) => {
      const decoder = decoding.createDecoder(message)
      const documentName = decoding.readVarString(decoder)
      if (decoding.readVarUint(decoder) !== MessageType.Auth) return
      const isDenied = decoding.readVarUint(decoder) === PERMISSION_DENIED
      authReplies.push({
        documentName,
        reason: isDenied ? decoding.readVarString(decoder) : undefined
      })
    }
  }
  const clientConnection = hocuspocus.handleConnection(
    websocket,
    new Request('http://localhost/yjs'),
    context
  )
  return {
    authReplies,
    authenticate: (documentName: string) => {
      const encoder = encoding.createEncoder()
      encoding.writeVarString(encoder, documentName)
      encoding.writeVarUint(encoder, MessageType.Auth)
      encoding.writeVarUint(encoder, TOKEN)
      encoding.writeVarString(encoder, '')
      clientConnection.handleMessage(encoding.toUint8Array(encoder))
    },
    waitForAuthReplies: async (count: number) => {
      while (authReplies.length < count) await new Promise((resolve) => setTimeout(resolve, 5))
    },
    close: async () => {
      clientConnection.handleClose()
      while (hocuspocus.getDocumentsCount() > 0) {
        await new Promise((resolve) => setTimeout(resolve, 5))
      }
    }
  }
}

const refuseEveryPage = (
  throttledAuthenticate: (payload: AuthenticatePayload) => Promise<unknown>,
  context: YjsContext,
  count: number
) =>
  Promise.allSettled(
    Array.from({length: count}, (_, idx) =>
      throttledAuthenticate({documentName: `page:${1000 + idx}`, context})
    )
  )

let warn: jest.SpyInstance
beforeEach(() => {
  warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  warn.mockRestore()
})

test('one socket authenticates hundreds of documents, but 100 refusals in a minute ban its user', async () => {
  const printError = jest.spyOn(console, 'error').mockImplementation(() => {})
  const logError = jest.spyOn(Logger, 'error').mockImplementation(() => {})
  const hocuspocus = new SafeHocuspocus<YjsContext>({
    quiet: true,
    maxPendingDocuments: 500,
    onAuthenticate: throttleRefusedAuthentication(authenticate)
  })
  const socket = openSocket(hocuspocus, {userId: 'user1', ip: '203.0.113.7'})
  for (let page = 1; page <= 300; page++) socket.authenticate(`page:${page}`)
  await socket.waitForAuthReplies(300)
  expect(socket.authReplies.filter(({reason}) => reason)).toEqual([])

  for (let page = 1000; page < 1100; page++) socket.authenticate(`page:${page}`)
  await socket.waitForAuthReplies(400)
  const errorsBeforeBan = printError.mock.calls.length + logError.mock.calls.length
  socket.authenticate('page:301')
  await socket.waitForAuthReplies(401)
  expect(socket.authReplies.at(-1)).toEqual({documentName: 'page:301', reason: 'TooManyRequests'})
  expect(authenticate).not.toHaveBeenCalledWith(expect.objectContaining({documentName: 'page:301'}))
  expect(printError.mock.calls.length + logError.mock.calls.length).toBe(errorsBeforeBan)
  expect(warn).toHaveBeenCalledTimes(1)
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('refusing every document'),
    expect.objectContaining({userId: 'user1', ip: '203.0.113.7'})
  )
  await socket.close()
  printError.mockRestore()
  logError.mockRestore()
})

test('signed-out sockets on one ip share a ban, and each signed-in user has their own', async () => {
  const throttledAuthenticate = throttleRefusedAuthentication(authenticate)
  await refuseEveryPage(throttledAuthenticate, {ip: '203.0.113.7'}, 100)
  await expect(
    throttledAuthenticate({documentName: 'page:1', context: {ip: '203.0.113.7'}})
  ).rejects.toEqual({reason: 'TooManyRequests'})
  await expect(
    throttledAuthenticate({documentName: 'page:1', context: {ip: '198.51.100.4'}})
  ).resolves.toEqual({})
  await expect(
    throttledAuthenticate({documentName: 'page:1', context: {userId: 'user1', ip: '203.0.113.7'}})
  ).resolves.toEqual({userId: 'user1'})
})

test('a burst of 2000 guesses at once runs 1000 of them and logs one ban', async () => {
  const throttledAuthenticate = throttleRefusedAuthentication(authenticate)
  await refuseEveryPage(throttledAuthenticate, {userId: 'user1', ip: '203.0.113.7'}, 2000)
  expect(authenticate).toHaveBeenCalledTimes(1000)
  expect(warn).toHaveBeenCalledTimes(1)
})

test('one user may have 1000 documents authenticating at once', async () => {
  const throttledAuthenticate = throttleRefusedAuthentication(authenticate)
  const context = {userId: 'user1'}
  const openPages = async (count: number) => {
    const results = await Promise.allSettled(
      Array.from({length: count}, (_, idx) =>
        throttledAuthenticate({documentName: `page:${(idx % 999) + 1}`, context})
      )
    )
    return results.map((result) => (result.status === 'fulfilled' ? 'opened' : result.reason))
  }
  const firstBurst = await openPages(1200)
  expect(firstBurst.filter((result) => result === 'opened')).toHaveLength(1000)
  expect(firstBurst.slice(1000)).toEqual(Array(200).fill({reason: 'TooManyRequests'}))
  const secondBurst = await openPages(1000)
  expect(secondBurst.filter((result) => result === 'opened')).toHaveLength(1000)
  expect(warn).not.toHaveBeenCalled()
})

test('ended sessions are not counted', async () => {
  const throttledAuthenticate = throttleRefusedAuthentication(authenticate)
  await refuseEveryPage(throttledAuthenticate, {ip: '203.0.113.7', isUnauthenticated: true}, 300)
  await expect(
    throttledAuthenticate({documentName: 'page:1', context: {ip: '203.0.113.7'}})
  ).resolves.toEqual({})
  expect(warn).not.toHaveBeenCalled()
})

test('refusals are forgotten after a minute, and a ban lifts after a minute', async () => {
  const now = jest.spyOn(Date, 'now').mockReturnValue(0)
  const throttledAuthenticate = throttleRefusedAuthentication(authenticate)
  const context = {userId: 'user1'}
  await refuseEveryPage(throttledAuthenticate, context, 99)
  now.mockReturnValue(ms('1m'))
  await refuseEveryPage(throttledAuthenticate, context, 99)
  await expect(throttledAuthenticate({documentName: 'page:1', context})).resolves.toEqual(context)
  await refuseEveryPage(throttledAuthenticate, context, 1)
  await expect(throttledAuthenticate({documentName: 'page:1', context})).rejects.toEqual({
    reason: 'TooManyRequests'
  })
  now.mockReturnValue(ms('2m') - 1)
  await expect(throttledAuthenticate({documentName: 'page:1', context})).rejects.toEqual({
    reason: 'TooManyRequests'
  })
  now.mockReturnValue(ms('2m'))
  await expect(throttledAuthenticate({documentName: 'page:1', context})).resolves.toEqual(context)
  now.mockRestore()
})
