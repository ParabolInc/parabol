import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getGitLabProjectsConn = (
  gitlabTeamMemberIntegration: ReadOnlyRecordProxy | null | undefined,
  selectedProjectsIds: string[] | null
) => {
  if (!gitlabTeamMemberIntegration) return null
  return ConnectionHandler.getConnection(
    gitlabTeamMemberIntegration,
    // 'GitLabScopingSearchResults_projectIssues',
    'GitLabScopingSearchResults_projectIssues',
    {
      searchQuery: '',

      // first: 20
      // membership: true,
      // sort: 'latest_activity_desc',

      // projectsIds: selectedProjectsIds,
      // includeSubepics: true,
      sort: 'UPDATED_DESC',
      state: 'opened'
      // first: 25
      // after: '',
      // searchQuery: ''
    }
  )
}

export default getGitLabProjectsConn
