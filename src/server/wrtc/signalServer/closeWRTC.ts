import getPubSub from '../../utils/getPubSub'
import {UWebSocket} from './handleSignal'

const closeWRTC = (ws: UWebSocket) => {
  if (!ws.context) return
  const {userId, roomId, subs} = ws.context
  const redis = getPubSub()
  subs.forEach((subId) => redis.unsubscribe(subId))
  subs.length = 0
  if (userId) {
    redis.publish(`signal/room/${roomId}`, JSON.stringify({type: 'leaveSwarm', userId})).catch()
  }
  delete ws.context
}

export default closeWRTC
