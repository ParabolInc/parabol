import {ProjectsIssuesArgs} from 'parabol-server/graphql/types/GitLabIntegration'
import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getGitLabProjectsIssuesConn = (
  gitlabTeamMemberIntegration: ReadOnlyRecordProxy | null | undefined,
  projectsIssuesArgs: Omit<ProjectsIssuesArgs, 'fullPath' | 'first'>
) => {
  if (!gitlabTeamMemberIntegration) return null
  return ConnectionHandler.getConnection(
    gitlabTeamMemberIntegration,
    'GitLabScopingSearchResults_projectsIssues',
    projectsIssuesArgs
  )
}

export default getGitLabProjectsIssuesConn
