import IntegrationRepoId from '../../../../client/shared/gqlIds/IntegrationRepoId'
import IntegrationSearchQueryId from '../../../../client/shared/gqlIds/IntegrationSearchQueryId'
import JiraProjectId from '../../../../client/shared/gqlIds/JiraProjectId'
import type {JiraSearchQueryResolvers} from '../resolverTypes'

const JiraSearchQuery: JiraSearchQueryResolvers = {
  id: ({id}) => IntegrationSearchQueryId.join('JiraSearchQuery', id),
  queryString: ({query}) => query.queryString,
  isJQL: ({query}) => query.isJQL,
  projectKeyFilters: ({query}) => query.projectKeyFilters ?? [],
  projectKeyFilterLabels: ({service, query}) =>
    (query.projectKeyFilters ?? []).map((filter) =>
      service === 'jiraServer'
        ? (IntegrationRepoId.split(filter).projectKey ?? filter)
        : JiraProjectId.split(filter).projectKey
    )
}

export default JiraSearchQuery
