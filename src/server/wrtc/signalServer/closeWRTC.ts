import getPubSub from '../../utils/getPubSub'
import {UWebSocket} from './handleSignal'

const closeWRTC = (socket: UWebSocket) => {
  if (socket.context) {
    const {userId, roomId, subs} = socket.context
    const redis = getPubSub()
    subs.forEach((subId) => redis.unsubscribe(subId))
    subs.length = 0
    if (userId) {
      redis.publish(`signal/room/${roomId}`, JSON.stringify({type: 'leaveSwarm', userId})).catch()
    }
    delete socket.context
  }
}

export default closeWRTC
