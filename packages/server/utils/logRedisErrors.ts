import type {EventEmitter} from 'node:events'
import {Logger} from './Logger'

// Without an error listener, ioredis prints each connection error to stderr as unstructured text
const logRedisErrors = (redis: EventEmitter, connectionName: string) => {
  redis.on('error', (error: Error) => {
    Logger.error(`Redis connection ${connectionName} failed`, error)
  })
}

export default logRedisErrors
