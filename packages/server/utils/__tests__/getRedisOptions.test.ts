import {type AddressInfo, createServer, type Server, type Socket} from 'node:net'
import Redis from 'ioredis'
import {getRedisOptions} from '../getRedisOptions'

const parseCommands = (buffer: string) => {
  const commands: string[][] = []
  let rest = buffer
  while (rest.startsWith('*')) {
    const lines = rest.split('\r\n')
    const argCount = Number(lines[0]!.slice(1))
    if (lines.length < 1 + argCount * 2) break
    const args = Array.from({length: argCount}, (_, i) => lines[2 + i * 2]!)
    commands.push(args)
    rest = lines.slice(1 + argCount * 2).join('\r\n')
  }
  return {commands, rest}
}

const startFakeValkey = (failFirstPublishWith: string) => {
  let connectionCount = 0
  const server: Server = createServer((socket: Socket) => {
    const connection = ++connectionCount
    let buffer = ''
    socket.on('data', (data) => {
      const {commands, rest} = parseCommands(buffer + data.toString())
      buffer = rest
      commands.forEach(([name]) => {
        const command = name!.toLowerCase()
        if (command === 'info') {
          const info = 'redis_version:9.0.0\r\nloading:0\r\n'
          socket.write(`$${info.length}\r\n${info}\r\n`)
        } else if (command === 'publish') {
          socket.write(connection === 1 ? `-${failFirstPublishWith}\r\n` : ':1\r\n')
        } else {
          socket.write('+OK\r\n')
        }
      })
    })
  })
  return new Promise<{server: Server; port: number; getConnectionCount: () => number}>(
    (resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const {port} = server.address() as AddressInfo
        resolve({server, port, getConnectionCount: () => connectionCount})
      })
    }
  )
}

const publishThroughFakeValkey = async (failFirstPublishWith: string) => {
  const {server, port, getConnectionCount} = await startFakeValkey(failFirstPublishWith)
  process.env.REDIS_URL = `redis://127.0.0.1:${port}`
  const redis = new Redis(process.env.REDIS_URL, getRedisOptions())
  try {
    const result = await redis.publish('channel', 'message')
    return {result, connectionCount: getConnectionCount()}
  } finally {
    redis.disconnect()
    server.close()
  }
}

test.each(['ERR role change occurred', "READONLY You can't write against a read only replica."])(
  'a command failed by a failover (%s) is sent again over a new connection',
  async (failoverError) => {
    const {result, connectionCount} = await publishThroughFakeValkey(failoverError)
    expect(result).toBe(1)
    expect(connectionCount).toBe(2)
  }
)

test('a command failed for any other reason is not sent again', async () => {
  await expect(publishThroughFakeValkey('ERR unknown command')).rejects.toThrow(
    'ERR unknown command'
  )
})
