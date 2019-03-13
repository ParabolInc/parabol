import {UWebSocket} from './handleSignal'

interface PublishToClientPayload {
  type: 'pubToClient'
  payload: any
}

const handlePublishToClient = (ws: UWebSocket, data: PublishToClientPayload) => {
  ws.send(JSON.stringify(data.payload))
}

export default handlePublishToClient
