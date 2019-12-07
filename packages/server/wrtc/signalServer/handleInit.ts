import getPubSub from '../../utils/getPubSub'
import handleSignal, {UWebSocket} from './handleSignal'

interface InitSignal {
  readonly type: 'init'
  readonly userId: string
  readonly roomId: string | number
}

// make the closure context as small as possible. there will be dozens of these. DOZENS
const handleMessage = (ws) => (data: string) => {
  handleSignal(ws, JSON.parse(data))
}

const handleInit = (ws: UWebSocket, payload: InitSignal) => {
  const {userId, roomId} = payload

  // exit if a duplicate init payload is sent or not authorized
  if (ws.context.userId) return
  ws.context.userId = userId
  const ps = getPubSub()
  const onMessage = handleMessage(ws)
  ps.publish(`signal/room/${roomId}`, {type: 'pubInit', userId, createdAt: ws.context.createdAt})

  const channels = [`signal/room/${roomId}`, `signal/user/${userId}`]
  const iterator = ps.subscribe(channels, onMessage)
  ws.context.iterators.push(iterator)
}

export default handleInit
