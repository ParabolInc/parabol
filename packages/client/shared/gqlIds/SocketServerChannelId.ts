const SocketServerChannelId = {
  join: (serverId: string) => `socketServer:${serverId}`,
  split: (id: string) => {
    const [, serverId] = id.split(':')
    return serverId
  }
}

export default SocketServerChannelId
