import type {MessageEventInit, WebSocket} from '@cloudflare/workers-types'
import {clearInterval, setInterval} from '@cloudflare/workers-types'
import type {Env} from './types'

interface ConnectionContext {
  id: number
  ws: WebSocket
  isAlive: boolean
  cancelKeepAlive: number | undefined
}
export class WebSockets implements DurableObject {
  env: Env
  connections = {} as Record<number, ConnectionContext>
  lastTimestamp = 0
  constructor(_controller: DurableObjectState, env: Env) {
    this.env = env
  }
  async fetch(request: Request) {
    const {headers, url} = request
    const urlObj = new URL(url)
    const {pathname} = urlObj
    if (pathname === '/connect') {
      if (headers.get('Upgrade') !== 'websocket') {
        return new Response('expected websocket', {status: 400})
      }
      const wsPair = new WebSocketPair()
      const [client, server] = Object.values(wsPair) as [globalThis.WebSocket, WebSocket]

      await this.connect(server)
      return new Response(null, {status: 101, webSocket: client})
    }
    return new Response('Not found', {status: 404})
  }

  async connect(ws: WebSocket) {
    ws.accept()
    const id = Math.max(Date.now(), this.lastTimestamp + 1)
    // TODO: in prod, account for leap seconds. use a real UID
    this.lastTimestamp = id
    const connectionContext = {id, ws, isAlive: true, cancelKeepAlive: undefined}
    this.connections[id] = connectionContext
    ws.addEventListener('message', (message: MessageEventInit) => {
      this.onData(message.data, connectionContext)
    })
    this.keepAlive(connectionContext)
  }
  onData = async (data: String | ArrayBuffer, connectionContext: ConnectionContext) => {
    const messageBuffer = Buffer.from(data as ArrayBuffer)
    console.log({messageBuffer})
    if (this.isPong(messageBuffer)) {
      this.keepAlive(connectionContext)
      return
    }

    // assume socket is ready because HACK WEEK lolz
    const parsedMessage = JSON.parse(messageBuffer.toString())
  }
  keepAlive(connectionContext: ConnectionContext) {
    connectionContext.isAlive = true
    clearInterval(connectionContext.cancelKeepAlive)
    connectionContext.cancelKeepAlive = setInterval(() => {
      const {isAlive, ws, id} = connectionContext
      if (isAlive === false || ws.readyState !== 1) {
        console.log('delete conn', id)
        delete this.connections[id]
        // handleDisconnect(connectionContext)
      } else {
        connectionContext.isAlive = false
        ws.send(new Uint8Array([57]))
      }
    })
  }
  isPong = (messageBuffer: Buffer) => messageBuffer.length === 1 && messageBuffer[0] === 65
}
