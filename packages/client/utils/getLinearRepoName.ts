type Project = {
  readonly name?: string
  readonly teams?: {
    readonly nodes: ReadonlyArray<{
      readonly displayName: string
    }>
  }
}

export const getLinearRepoName = (
  project: Project | null | undefined,
  teamName?: string | null | undefined
) => {
  if (!project) return teamName || 'Unknown'

  const projectName = project.name || 'Unknown Project'
  const resolvedTeamName = teamName || project.teams?.nodes?.[0]?.displayName

  return resolvedTeamName ? `${resolvedTeamName}/${projectName}` : projectName
}
