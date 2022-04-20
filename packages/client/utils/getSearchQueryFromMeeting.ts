import {PokerScopeMeeting} from '~/mutations/UpdatePokerScopeMutation'
import {TaskServiceEnum} from '../__generated__/UpdatePokerScopeMutation.graphql'

const getSearchQueryFromMeeting = (meeting: PokerScopeMeeting, service: TaskServiceEnum) => {
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
