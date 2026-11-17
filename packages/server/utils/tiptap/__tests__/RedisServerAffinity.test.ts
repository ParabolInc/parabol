import type {onConfigurePayload} from '@hocuspocus/server'
import type RedisClient from 'ioredis'
import {getLogContext, runWithLogContext} from '../../requestLogContext'
import {RedisServerAffinity} from '../RedisServerAffinity'

test('the document lock refresh does not log as the socket that loaded the document', async () => {
  const firstRefresh = Promise.withResolvers<unknown>()
  const fakeRedis = {
    subscribe: () => Promise.resolve(),
    on: () => {},
    del: () => Promise.resolve(1),
    set: () => {
      firstRefresh.resolve(getLogContext())
      return Promise.resolve('OK')
    }
  }
  const affinity = new RedisServerAffinity({
    redis: {duplicate: () => fakeRedis} as unknown as RedisClient,
    serverId: 'server1',
    lockTTL: 20,
    pack: (message) => JSON.stringify(message),
    unpack: (packedMessage) => JSON.parse(packedMessage.toString())
  })
  await runWithLogContext({ip: '203.0.113.7', sessionId: 'tab-1', component: 'yjs'}, () =>
    affinity.maintainLock('page:1')
  )
  const contextSeenByLockRefresh = await firstRefresh.promise
  await affinity.releaseLock('page:1')
  expect(contextSeenByLockRefresh).toBeUndefined()
})

test('a proxied socket handles its messages as its own user, ip and tab session', async () => {
  let handleRedisMessage = (_channel: Buffer, _packedMessage: Buffer) => Promise.resolve()
  const fakeRedis = {
    subscribe: () => Promise.resolve(),
    on: (event: string, handler: typeof handleRedisMessage) => {
      if (event === 'messageBuffer') handleRedisMessage = handler
    }
  }
  const affinity = new RedisServerAffinity({
    redis: {duplicate: () => fakeRedis} as unknown as RedisClient,
    serverId: 'server1',
    pack: (message) => JSON.stringify(message),
    unpack: (packedMessage) => JSON.parse(packedMessage.toString()),
    deriveContext: () => ({userId: 'user1'})
  })
  const contextSeenByHandleMessage = Promise.withResolvers<unknown>()
  const instance = {
    handleConnection: () => ({
      handleMessage: () => contextSeenByHandleMessage.resolve(getLogContext())
    })
  }
  await affinity.onConfigure({instance} as unknown as onConfigurePayload)
  const proxyMessage = {
    type: 'proxy',
    replyTo: 'rsaMsg:server2',
    message: [],
    serializedHTTPRequest: {
      method: 'GET',
      url: '/yjs?sessionId=tab-1',
      headers: {'sec-websocket-key': 'socket1'},
      socket: {remoteAddress: '203.0.113.7'},
      connectedAt: 0
    }
  }
  await handleRedisMessage(Buffer.from('rsaMsg:server1'), Buffer.from(JSON.stringify(proxyMessage)))
  expect(await contextSeenByHandleMessage.promise).toEqual({
    userId: 'user1',
    ip: '203.0.113.7',
    sessionId: 'tab-1',
    component: 'yjs'
  })
})
