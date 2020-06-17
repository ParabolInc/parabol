import SegmentIo from 'analytics-node'
import crypto from 'crypto'
import db from '../db'
import PROD from '../PROD'
import {toEpochSeconds} from './epochTime'

const {SEGMENT_WRITE_KEY, SERVER_SECRET} = process.env

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
  const user = await db.read('User', options.userId)
  const {email} = user
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
