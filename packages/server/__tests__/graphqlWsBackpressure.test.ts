import type {WebSocket} from 'uWebSockets.js'
import {GraphQLObjectType, GraphQLSchema, GraphQLString} from 'graphql'
import {makeBehavior} from 'graphql-ws/use/uWebSockets'

// graphql-ws waits for a backpressured socket to drain before it sends that operation's next message.
// patches/graphql-ws@6.2.1.patch makes each socket wait on its own drain
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {hello: {type: GraphQLString, resolve: () => 'world'}}
  })
})

const makeSocket = () => {
  const messageTypes: string[] = []
  const messageTypesSentInDrain: string[] = []
  const socket = {
    isBackpressured: false,
    isInDrain: false,
    messageTypes,
    messageTypesSentInDrain,
    persistedRequest: {
      method: 'GET',
      url: '/',
      query: '',
      headers: {'sec-websocket-protocol': 'graphql-transport-ws'}
    },
    // uWS returns 0 when the message is buffered behind backpressure that drains later
    send: (message: string) => {
      const {type} = JSON.parse(message)
      messageTypes.push(type)
      if (socket.isInDrain) messageTypesSentInDrain.push(type)
      return socket.isBackpressured ? 0 : 1
    },
    ping: () => 1,
    end: () => {}
  }
  return socket as typeof socket & WebSocket<unknown>
}

const receive = (
  behavior: ReturnType<typeof makeBehavior>,
  socket: WebSocket<unknown>,
  message: object
) =>
  behavior.message!(
    socket,
    new TextEncoder().encode(JSON.stringify(message)).buffer as ArrayBuffer,
    false
  )

const subscribe = {id: '1', type: 'subscribe', payload: {query: '{hello}'}}

// no keep-alive pings or connection_init deadline, so no timers outlive a test
const makeTestBehavior = () => makeBehavior({schema, connectionInitWaitTimeout: 0}, {}, 0)

// graphql-ws handles a message with promises alone, so a macrotask lets it run as far as it can
const settle = () => new Promise((resolve) => setImmediate(resolve))

// uWS.js runs the microtasks that a callback queues before the callback returns, so they happen inside the drain
const drain = (
  behavior: ReturnType<typeof makeBehavior>,
  socket: ReturnType<typeof makeSocket>
) => {
  socket.isInDrain = true
  setImmediate(() => {
    socket.isInDrain = false
  })
  behavior.drain!(socket)
}

test('a drain resumes the operations on the socket that drained', async () => {
  const behavior = makeTestBehavior()
  const sockets = [makeSocket(), makeSocket()]
  for (const socket of sockets) {
    behavior.open!(socket)
    await receive(behavior, socket, {type: 'connection_init'})
    socket.isBackpressured = true
    void receive(behavior, socket, subscribe)
  }
  await settle()
  const [first, second] = sockets
  expect(first!.messageTypes).toEqual(['connection_ack', 'next'])
  expect(second!.messageTypes).toEqual(['connection_ack', 'next'])

  first!.isBackpressured = false
  behavior.drain!(first!)
  await settle()
  expect(first!.messageTypes).toEqual(['connection_ack', 'next', 'complete'])
  expect(second!.messageTypes).toEqual(['connection_ack', 'next'])
})

test('a drain resumes sending only after uWS returns from the drain callback', async () => {
  // a large send that only partly writes from inside the drain callback leaves uWS no longer waiting for the socket to
  // become writable, so the socket never drains again (uNetworking/uSockets#265)
  const behavior = makeTestBehavior()
  const socket = makeSocket()
  behavior.open!(socket)
  await receive(behavior, socket, {type: 'connection_init'})
  socket.isBackpressured = true
  void receive(behavior, socket, subscribe)
  await settle()

  socket.isBackpressured = false
  drain(behavior, socket)
  await settle()
  expect(socket.messageTypes).toEqual(['connection_ack', 'next', 'complete'])
  expect(socket.messageTypesSentInDrain).toEqual([])
})

test('closing a socket ends the operations waiting on its drain', async () => {
  const behavior = makeTestBehavior()
  const socket = makeSocket()
  behavior.open!(socket)
  await receive(behavior, socket, {type: 'connection_init'})
  socket.isBackpressured = true
  let isOperationDone = false
  void Promise.resolve(receive(behavior, socket, subscribe)).then(() => {
    isOperationDone = true
  })
  await settle()
  expect(isOperationDone).toBe(false)

  behavior.close!(socket, 1001, new ArrayBuffer(0))
  await settle()
  expect(isOperationDone).toBe(true)
  // the socket is gone, so nothing more is sent to it
  expect(socket.messageTypes).toEqual(['connection_ack', 'next'])
})
