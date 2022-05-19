import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'
import {ProjectsIssuesArgs} from './../../../server/graphql/types/GitLabIntegration'

const getGitLabProjectsConn = (
  gitlabTeamMemberIntegration: ReadOnlyRecordProxy | null | undefined,
  projectIssuesArgs: Omit<ProjectsIssuesArgs, 'fullPath' | 'first'>
) => {
  if (!gitlabTeamMemberIntegration) return null
  return ConnectionHandler.getConnection(
    gitlabTeamMemberIntegration,
    'GitLabScopingSearchResults_projectIssues',
    projectIssuesArgs
  )
}

export default getGitLabProjectsConn
