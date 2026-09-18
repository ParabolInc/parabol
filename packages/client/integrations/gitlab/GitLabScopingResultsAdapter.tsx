import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {usePaginationFragment, usePreloadedQuery} from 'react-relay'
import type {GitLabScopingResultsAdapter_query$key} from '../../__generated__/GitLabScopingResultsAdapter_query.graphql'
import type {GitLabScopingResultsAdapterPaginationQuery} from '../../__generated__/GitLabScopingResultsAdapterPaginationQuery.graphql'
import type {GitLabScopingResultsAdapterQuery} from '../../__generated__/GitLabScopingResultsAdapterQuery.graphql'
import GitLabIssueId from '../../shared/gqlIds/GitLabIssueId'
import type {GQLType} from '../../types/generics'
import getNonNullEdges from '../../utils/getNonNullEdges'
import {parseWebPath} from '../../utils/parseWebPath'
import type {ResultsAdapterProps} from '../platform/ScopingSearchState'

const query = graphql`
  query GitLabScopingResultsAdapterQuery(
    $teamId: ID!
    $queryString: String!
    $selectedProjectsIds: [String!]
    $sort: String!
    $state: String!
  ) {
    ...GitLabScopingResultsAdapter_query
  }
`

const GitLabScopingResultsAdapter = (
  props: ResultsAdapterProps<GitLabScopingResultsAdapterQuery>
) => {
  const {queryRef, context, children} = props
  const {providerId} = context
  const queryData = usePreloadedQuery<GitLabScopingResultsAdapterQuery>(query, queryRef)
  const {data, hasNext, isLoadingNext, loadNext} = usePaginationFragment<
    GitLabScopingResultsAdapterPaginationQuery,
    GitLabScopingResultsAdapter_query$key
  >(
    graphql`
      fragment GitLabScopingResultsAdapter_query on Query
      @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 25})
      @refetchable(queryName: "GitLabScopingResultsAdapterPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              gitlab {
                projectsIssues(
                  projectsIds: $selectedProjectsIds
                  first: $count
                  after: $cursor
                  searchQuery: $queryString
                  state: $state
                  sort: $sort
                ) @connection(key: "GitLabScopingSearchResults_projectsIssues") {
                  error {
                    message
                  }
                  edges {
                    node {
                      __typename
                      ... on _xGitLabIssue {
                        id
                        iid
                        title
                        webPath
                        webUrl
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryData
  )
  const projectsIssues = data.viewer.teamMember?.integrations.gitlab.projectsIssues
  const error = projectsIssues?.error?.message ?? undefined
  const edges = projectsIssues?.edges
  const items = useMemo(
    () =>
      getNonNullEdges(edges ?? [])
        .filter((edge) => edge.node.__typename === '_xGitLabIssue')
        .map(({node}) => node as GQLType<typeof node, '_xGitLabIssue'>)
        .map(({id, iid, title, webPath, webUrl}) => {
          const {fullPath} = parseWebPath(webPath)
          const linkText = `#${iid} ${fullPath}`
          return {
            serviceTaskId: GitLabIssueId.join(providerId, id),
            summary: title,
            url: webUrl,
            linkText,
            linkTitle: linkText
          }
        }),
    [edges, providerId]
  )
  return children({items, error, hasNext, isLoadingNext, loadNext: () => loadNext(25)})
}

export default GitLabScopingResultsAdapter
