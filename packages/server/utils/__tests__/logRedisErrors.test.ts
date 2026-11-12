import {EventEmitter} from 'node:events'
import logRedisErrors from '../logRedisErrors'

test('a Redis connection error is logged as an error that names the connection', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  const redis = new EventEmitter()
  logRedisErrors(redis, 'getPubSub_sub')
  const error = new Error('connect ETIMEDOUT')
  redis.emit('error', error)
  expect(errorSpy).toHaveBeenCalledWith('Redis connection getPubSub_sub failed', error)
  errorSpy.mockRestore()
})
