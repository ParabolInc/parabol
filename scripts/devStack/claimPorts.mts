import net from 'net'

const isListening = (port: number, host: string) =>
  new Promise<boolean>((resolve) => {
    const socket = net.connect({port, host})
    const finish = (listening: boolean) => {
      socket.destroy()
      resolve(listening)
    }
    socket.setTimeout(500)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })

const isFree = async (port: number) => {
  const listeners = await Promise.all([isListening(port, '127.0.0.1'), isListening(port, '::1')])
  return !listeners.some(Boolean)
}

// PORT & SOCKET_PORT from .env are where the search starts
// If another checkout is already serving there, both move up by 10 until they are free, so stacks run side by side
const claimPorts = async () => {
  const firstPort = Number(process.env.PORT)
  const firstSocketPort = Number(process.env.SOCKET_PORT)
  for (let offset = 0; offset < 1000; offset += 10) {
    const port = firstPort + offset
    const socketPort = firstSocketPort + offset
    const free = await Promise.all([isFree(port), isFree(socketPort)])
    if (free.every(Boolean)) return {port, socketPort, offset}
  }
  throw new Error(`No free ports found above ${firstPort}`)
}

export default claimPorts
