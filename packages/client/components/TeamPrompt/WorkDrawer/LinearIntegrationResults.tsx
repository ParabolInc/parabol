import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import {Link} from 'react-router-dom'
// NOTE: Using GitHub's empty state image temporarily. Replace if a Linear-specific one exists.
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import {LinearIntegrationResultsPaginationQuery} from '../../../__generated__/LinearIntegrationResultsPaginationQuery.graphql'
import {LinearIntegrationResultsQuery} from '../../../__generated__/LinearIntegrationResultsQuery.graphql'
import {
  LinearIntegrationResults_query$data,
  LinearIntegrationResults_query$key
} from '../../../__generated__/LinearIntegrationResults_query.graphql'
import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import Ellipsis from '../../Ellipsis/Ellipsis'

type LinearIssueEdge = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<
        LinearIntegrationResults_query$data['viewer']['teamMember']
      >['integrations']['linear']['api']
    >['query']
  >['issues']['edges']
>[number]

// Placeholder type for the issue node, replace with generated type later
type LinearIssueNode = NonNullable<LinearIssueEdge>['node']

interface Props {
  queryRef: PreloadedQuery<LinearIntegrationResultsQuery>
  teamId: string
}

const LinearIntegrationResults = (props: Props) => {
  const {queryRef, teamId} = props

  // This query definition must match the one used to generate the queryRef in the parent component (LinearIntegrationResultsRoot)
  // Assuming the filter variable passed down is a string intended for title search.
  const queryData = usePreloadedQuery<LinearIntegrationResultsQuery>(
    graphql`
      query LinearIntegrationResultsQuery($teamId: ID!, $filter: _xLinearIssueFilter) {
        # Pass the filter string to the fragment
        ...LinearIntegrationResults_query @arguments(teamId: $teamId, filter: $filter)
      }
    `,
    queryRef
  )

  // This fragment defines the data structure and pagination logic for Linear issues
  const paginationFragment = graphql`
    fragment LinearIntegrationResults_query on Query
    @argumentDefinitions(
      cursor: {type: "String"}
      count: {type: "Int", defaultValue: 25}
      teamId: {type: "ID!"}
      filter: {type: "_xLinearIssueFilter"}
    )
    @refetchable(queryName: "LinearIntegrationResultsPaginationQuery") {
      # The filter is applied directly to the 'issues' connection below
      viewer {
        teamMember(teamId: $teamId) {
          integrations {
            linear {
              api {
                errors {
                  message
                  locations {
                    line
                    column
                  }
                  path
                }
                query {
                  issues(first: $count, after: $cursor, filter: $filter)
                    @connection(key: "LinearIntegrationResults_query_issues") {
                    edges {
                      node {
                        ... on _xLinearIssue {
                          id
                          identifier
                          title
                          url
                          project {
                            name
                          }
                          team {
                            displayName
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  const paginationRes = usePaginationFragment<
    LinearIntegrationResultsPaginationQuery,
    LinearIntegrationResults_query$key
  >(paginationFragment, queryData)

  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 20)
  const {data, hasNext} = paginationRes

  const linear = data.viewer?.teamMember?.integrations.linear
  const linearIssues = linear?.api?.query?.issues?.edges?.map((edge: LinearIssueEdge) => edge?.node)
  const errors = linear?.api?.errors ?? null

  return (
    <>
      <div className='flex h-full flex-col gap-y-2 overflow-auto px-4'>
        {linearIssues && linearIssues.length > 0 ? (
          linearIssues.map((issue: LinearIssueNode) => {
            if (!issue) {
              return null
            }

            const {identifier, title, project, team, url} = issue
            const projectName = project?.name
            const teamName = team?.displayName ?? 'Unknown Team'
            const repoStr = projectName ? `${teamName} / ${projectName}` : teamName

            return (
              <div
                key={issue.id}
                className='border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded border bg-white p-2'
              >
                <div className='flex items-center gap-x-2'>
                  <a
                    href={url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 dark:text-blue-400 flex-shrink-0 font-medium hover:underline'
                    title={title}
                  >
                    {identifier}
                  </a>
                  <span className='text-gray-800 dark:text-gray-200 truncate text-sm' title={title}>
                    {title}
                  </span>
                </div>
                {repoStr && (
                  <div className='text-gray-500 dark:text-gray-400 mt-1 text-xs'>{repoStr}</div>
                )}
              </div>
            )
          })
        ) : (
          // Empty or Error State (Adapted from GitHubIntegrationResults)
          <div className='-mt-14 flex h-full flex-col items-center justify-center text-center'>
            <img
              className='w-20'
              src={halloweenRetrospectiveTemplate}
              alt='No results illustration'
            />
            <div className='text-gray-600 dark:text-gray-400 mt-7 w-2/3 text-sm'>
              {errors?.[0]?.message
                ? `Error fetching Linear issues: ${errors[0].message}`
                : `Looks like no Linear issues match your filter.`}
            </div>
            <Link
              to={`/team/${teamId}/integrations`}
              className='mt-4 font-semibold text-sky-500 hover:text-sky-400'
            >
              Review Linear integration settings
            </Link>
          </div>
        )}

        {lastItem}

        {hasNext && (
          <div className='mx-auto -mt-4 mb-4 h-8 text-2xl' key={'loadingNext'}>
            <Ellipsis />
          </div>
        )}
      </div>
    </>
  )
}

export default LinearIntegrationResults
