export const EmbedderChannelId = {
  join: (serverId: string) => `embedder:${serverId}`,
  split: (id: string) => {
    const [, serverId] = id.split(':')
    return serverId
  }
}

export default EmbedderChannelId
