const LinearProjectId = {
  join: (teamId: string, projectId?: string) => (projectId ? `${teamId}:${projectId}` : teamId),
  split: (id: string) => {
    const ids = id.split(':')
    const teamId = ids[0]
    const projectId = ids.length > 1 ? ids[1] : undefined
    return {teamId, projectId}
  }
}

export default LinearProjectId
