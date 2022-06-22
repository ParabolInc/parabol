import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

type ProjectsIssuesArgs = {
  projectsIds: string[] | null
  searchQuery: string
  sort: string
  state: string
}

const getGitLabProjectsIssuesConn = (
  gitlabTeamMemberIntegration: ReadOnlyRecordProxy | null | undefined,
  projectsIssuesArgs: ProjectsIssuesArgs
) => {
  if (!gitlabTeamMemberIntegration) return null
  return ConnectionHandler.getConnection(
    gitlabTeamMemberIntegration,
    'GitLabScopingSearchResults_projectsIssues',
    projectsIssuesArgs
  )
}

export default getGitLabProjectsIssuesConn
