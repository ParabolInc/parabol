import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getGitLabProjectsConn = (
  gitlabTeamMemberIntegration: ReadOnlyRecordProxy | null | undefined,
  selectedProjectsIds: string[] | null
) => {
  if (!gitlabTeamMemberIntegration) return null
  return ConnectionHandler.getConnection(
    gitlabTeamMemberIntegration,
    'GitLabScopingSearchResults_projects',
    {
      membership: true,
      sort: 'latest_activity_desc',
      ids: selectedProjectsIds
    }
  )
}

export default getGitLabProjectsConn
