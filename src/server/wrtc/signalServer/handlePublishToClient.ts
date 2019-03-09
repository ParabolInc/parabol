import {UWebSocket} from './handleSignal'

interface PublishToClientPayload {
  type: 'pubToClient'
  payload: any
}

const handlePublishToClient = (ws: UWebSocket, payload: PublishToClientPayload) => {
  ws.send(JSON.stringify(payload))
}

export default handlePublishToClient
