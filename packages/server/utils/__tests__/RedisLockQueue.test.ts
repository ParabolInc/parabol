/* eslint-env jest */
import RedisLockQueue from '../RedisLockQueue'
import sleep from 'parabol-client/utils/sleep'

test('lock calls are queued properly', async () => {
  await Promise.all(
    [1, 2, 3].map(async () => {
      const redisLock = new RedisLockQueue(`lockCallsAreQueuedProperly`, 1000)
      await redisLock.lock(200)
      await sleep(10)
      await redisLock.unlock()
    })
  )
})

test('lock calls fail when timing out', async () => {
  await expect(
    Promise.all(
      [1, 2, 3].map(async () => {
        const redisLock = new RedisLockQueue(`lockCallsFailWhenTimingOut`, 1000)
        await redisLock.lock(200)
        await sleep(300)
        await redisLock.unlock()
      })
    )
  ).rejects.toThrow('Could not achieve lock')
})

test('tryLock calls are queued properly', async () => {
  const locked = await Promise.all(
    [1, 2, 3].map(async () => {
      const redisLock = new RedisLockQueue(`tryLockCallsAreQueuedProperly`, 1000)
      if (await redisLock.tryLock(200)) {
        await sleep(10)
        await redisLock.unlock()
        return true
      }
      return false
    })
  )
  expect(locked).toEqual([true, true, true])
})

test('tryLock calls fail when timing out', async () => {
  const locked = await Promise.all(
    [1, 2, 3].map(async () => {
      const redisLock = new RedisLockQueue(`tryLockCallsFailWhenTimingOut`, 1000)
      if (await redisLock.tryLock(200)) {
        await sleep(300)
        await redisLock.unlock()
        return true
      }
      return false
    })
  )
  expect(locked).toEqual([true, false, false])
})
