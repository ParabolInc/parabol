import {
  TaskServiceEnum,
  UpdatePokerScopeMutationResponse
} from '../__generated__/UpdatePokerScopeMutation.graphql'

const getSearchQueryFromMeeting = (
  meeting: NonNullable<UpdatePokerScopeMutationResponse['updatePokerScope']['meeting']>,
  service: TaskServiceEnum
) => {
  switch (service) {
    case 'PARABOL':
      const {parabolSearchQuery} = meeting
      return [parabolSearchQuery.queryString]
    case 'github':
      const {githubSearchQuery} = meeting
      return [githubSearchQuery.queryString]
    case 'gitlab':
      const {gitlabSearchQuery} = meeting
      const {queryString, selectedProjectsIds} = gitlabSearchQuery
      return [queryString, selectedProjectsIds]
    case 'jira':
      const {jiraSearchQuery} = meeting
      const {queryString: jiraQueryString, projectKeyFilters} = jiraSearchQuery
      return [jiraQueryString, projectKeyFilters]
  }
  return null
}

export default getSearchQueryFromMeeting
