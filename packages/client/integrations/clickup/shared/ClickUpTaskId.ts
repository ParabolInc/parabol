const INTEGRATION_HASH = /^(\d+)::([a-z0-9]+)$/i

const ClickUpTaskId = {
  join: (workspaceId: string, taskId: string) => `${workspaceId}::${taskId}`,
  split: (integrationHash: string) => {
    const [, workspaceId, taskId] = INTEGRATION_HASH.exec(integrationHash) ?? []
    if (!workspaceId || !taskId) return null
    return {workspaceId, taskId}
  }
}

export default ClickUpTaskId
