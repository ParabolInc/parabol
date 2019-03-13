import getPubSub from '../../utils/getPubSub'
import {UWebSocket} from './handleSignal'

const closeWRTC = async (socket: UWebSocket) => {
  if (socket.context) {
    const {id, roomId, subs} = socket.context
    const redis = getPubSub()
    subs.forEach((subId) => redis.unsubscribe(subId))
    subs.length = 0
    if (id) {
      redis
        .publish(
          `signal/room/${roomId}`,
          JSON.stringify({type: 'pubToClient', payload: {type: 'leaveSwarm', from: id}})
        )
        .catch()
    }
  }
}

export default closeWRTC
