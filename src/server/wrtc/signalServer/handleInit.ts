import getPubSub from '../../utils/getPubSub'
import handleSignal, {UWebSocket} from './handleSignal'

export interface InitPayload {
  type: 'init'
  sdp: string
  connectionId: string
  from: string
  roomId: string
}

// make the closure context as small as possible. there will be dozens of these. DOZENS
const handleMessage = (ws) => (data: string) => {
  handleSignal(ws, JSON.parse(data))
}

const handleInit = (ws: UWebSocket, payload: InitPayload) => {
  const {from, roomId} = payload
  // exit if a duplicate init payload is sent or not authorized
  if (ws.context.id || !ws.context.rooms.includes(roomId)) return
  ws.context.init(payload)
  // channel to receive comms from other websockets, will verify payload.from is a UUID in pubInit
  const ps = getPubSub()
  const onMessage = handleMessage(ws)
  ps.publish(`signal/room/${roomId}`, JSON.stringify({type: 'pubInit', from})).catch()
  ps.subscribe(`signal/room/${roomId}`, onMessage).catch()
  ps.subscribe(`signal/user/${from}`, onMessage).catch()
}

export default handleInit
