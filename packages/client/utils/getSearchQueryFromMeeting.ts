import {PokerScopeMeeting} from '~/mutations/UpdatePokerScopeMutation'
import {TaskServiceEnum} from '../__generated__/UpdatePokerScopeMutation.graphql'

const getSearchQueryFromMeeting = (meeting: PokerScopeMeeting, service: TaskServiceEnum) => {
  switch (service) {
    case 'PARABOL':
      const {parabolSearchQuery} = meeting
      return {
        searchQueryString: parabolSearchQuery.queryString ?? undefined
      }
    case 'github':
      const {githubSearchQuery} = meeting
      return {
        searchQueryString: githubSearchQuery.queryString ?? undefined
      }
    case 'gitlab':
      const {gitlabSearchQuery} = meeting
      const {queryString, selectedProjectsIds} = gitlabSearchQuery
      return {
        searchQueryString: queryString,
        searchQueryFilters: selectedProjectsIds?.concat()
      }
    case 'jira':
      const {jiraSearchQuery} = meeting
      const {queryString: jiraQueryString, projectKeyFilters} = jiraSearchQuery
      return {
        searchQueryString: jiraQueryString,
        searchQueryFilters: projectKeyFilters.concat()
      }
  }
  return undefined
}

export default getSearchQueryFromMeeting
