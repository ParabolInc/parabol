//@ts-ignore
import WebSocket from 'ws'

const HOST = 'localhost:3001'

interface PromiseResolver<T> {
  resolve: (valut: T) => void
  reject: (error: Error) => void
}

interface GraphQLPayload {
  data: any
  errors: [any]
}

type CleanupFun = () => void | Promise<void>
const cleanups = [] as CleanupFun[]

afterEach(async () => {
  let con: CleanupFun | undefined
  do {
    con = cleanups.pop()
    await con?.()
  } while (con)
})

export const socketConnection = async (authToken: string) => {
  const responses = new Map<number, IteratorResult<GraphQLPayload>[]>()
  const responsePromises = new Map<number, PromiseResolver<IteratorResult<GraphQLPayload>>>()

  const socket = await new Promise<WebSocket>((resolve, reject) => {
    const ws = new WebSocket(`ws://${HOST}/?token=${authToken}`, ['trebuchet-ws'])
    ws.addListener('message', (event) => {
      const message = event.toString()
      // ping pong
      if (event.toString() === '9') {
        ws.send('A')
        return
      }
      const parsedMessage = JSON.parse(message)
      const {id, type, payload} = parsedMessage instanceof Array ? parsedMessage[0] : parsedMessage
      // not a response
      if (!id) {
        return
      }
      const {data, errors} = payload
      const existingPromise = responsePromises.get(id)
      const done = type === 'complete' || type === 'error' ? true : undefined
      if (existingPromise) {
        if (data) {
          existingPromise.resolve({
            value: {
              data
            },
            done
          } as any)
        } else {
          existingPromise.reject(errors)
        }
      } else {
        const q = responses.get(id) ?? []
        q.push({
          value: payload,
          done
        })
        responses.set(id, q)
      }
    })

    ws.addListener('open', () => {
      resolve(ws)
    })
    /*
    ws.addListener('close', (event) => {
      resolve(ws)
    })
    */
    ws.addListener('error', (error) => {
      reject(error)
    })
  })

  let id = 0

  const query = async ({query, variables}: {query: string; variables?: Record<string, any>}) => {
    const queryId = ++id
    socket.send(
      JSON.stringify({
        id: queryId,
        type: 'start',
        payload: {
          // the server fails to recognize subscriptions when there is leading whitespace
          query: query.trim(),
          variables
        }
      })
    )

    const result = await new Promise<IteratorResult<GraphQLPayload>>((resolve, reject) => {
      responsePromises.set(queryId, {resolve, reject})
    })
    return result.value
  }

  const subscribe = ({query, variables}: {query: string; variables?: Record<string, any>}) => {
    const subscriptionId = ++id
    socket.send(
      JSON.stringify({
        id: subscriptionId,
        type: 'start',
        payload: {
          query: query.trim(),
          variables
        }
      })
    )

    return (async function* () {
      let done = false
      do {
        const q = responses.get(subscriptionId)
        if (q && q.length > 0) {
          const response = q.shift()!
          yield response.value
          done = !!response.done
        } else {
          const response = await new Promise<IteratorResult<GraphQLPayload>>((resolve, reject) => {
            responsePromises.set(subscriptionId, {resolve, reject})
          })
          yield response.value
          done = !!response.done
        }
      } while (!done)
    })()
  }

  const close = async () => {
    socket.close()
  }
  cleanups.push(close)

  return {
    socket,
    query,
    subscribe,
    close
  }
}

export default socketConnection
