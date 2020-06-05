import SegmentIo from 'analytics-node'
import crypto from 'crypto'
import getRethink from '../database/rethinkDriver'
import PROD from '../PROD'
import {toEpochSeconds} from './epochTime'
import getRedis from './getRedis'
import sendToSentry from './sendToSentry'

const {SEGMENT_WRITE_KEY, SERVER_SECRET} = process.env

const getEmail = async (userId: string) => {
  const redis = getRedis()
  const key = `email:${userId}`
  const email = await redis.get(key)
  if (email) return email
  const r = await getRethink()
  const dbEmail = await r
    .table('User')
    .get(userId)('email')
    .run()
  if (!dbEmail) {
    sendToSentry(new Error('Email for user not found'), {userId})
    return ''
  }
  await redis.set(key, dbEmail)
  return dbEmail
}

const segmentIo = new SegmentIo(SEGMENT_WRITE_KEY || 'x', {
  flushAt: PROD ? 20 : 1,
  enable: !!SEGMENT_WRITE_KEY
}) as any
segmentIo._track = segmentIo.track
segmentIo.track = async (options) => {
  const now = new Date()
  const ts = String(toEpochSeconds(now))
  const parabolToken = crypto
    .createHmac('sha256', SERVER_SECRET!)
    .update(ts)
    .digest('base64')
  const {userId, event, properties} = options
  const email = await getEmail(options.userId as string)
  return (segmentIo as any)._track({
    userId,
    event,
    properties: {
      ...properties,
      email
    },
    timestamp: now,
    parabolToken: parabolToken as any
  })
}
export default segmentIo as SegmentIo
