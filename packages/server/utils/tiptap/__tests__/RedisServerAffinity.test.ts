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
