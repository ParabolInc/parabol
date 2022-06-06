const GQLExecutorChannelId = {
  join: (serverId: string) => `gqlExecutor:${serverId}`,
  split: (id: string) => {
    const [, serverId] = id.split(':')
    return serverId
  }
}

export default GQLExecutorChannelId
