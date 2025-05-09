import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import {Link} from 'react-router-dom'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import {LinearIntegrationResultsPaginationQuery} from '../../../__generated__/LinearIntegrationResultsPaginationQuery.graphql'
import {LinearIntegrationResultsQuery} from '../../../__generated__/LinearIntegrationResultsQuery.graphql'
import {LinearIntegrationResults_query$key} from '../../../__generated__/LinearIntegrationResults_query.graphql'
import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import Ellipsis from '../../Ellipsis/Ellipsis'
import LinearObjectCard from './LinearObjectCard'

interface Props {
  queryRef: PreloadedQuery<LinearIntegrationResultsQuery>
  teamId: string
}

const LinearIntegrationResults = (props: Props) => {
  const {queryRef, teamId} = props

  const queryData = usePreloadedQuery<LinearIntegrationResultsQuery>(
    graphql`
      query LinearIntegrationResultsQuery($teamId: ID!, $filter: _xLinearIssueFilter) {
        ...LinearIntegrationResults_query @arguments(teamId: $teamId, filter: $filter)
      }
    `,
    queryRef
  )

  const paginationFragment = graphql`
    fragment LinearIntegrationResults_query on Query
    @argumentDefinitions(
      cursor: {type: "String"}
      count: {type: "Int", defaultValue: 25}
      teamId: {type: "ID!"}
      filter: {type: "_xLinearIssueFilter"}
    )
    @refetchable(queryName: "LinearIntegrationResultsPaginationQuery") {
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
                  issues(
                    first: $count
                    after: $cursor
                    filter: $filter
                    sort: {updatedAt: {order: Descending}}
                  ) @connection(key: "LinearIntegrationResults_query_issues") {
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
                          ...LinearObjectCard_issue
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
  const linearIssues = linear?.api?.query?.issues?.edges?.map((edge) => edge?.node)
  const errors = linear?.api?.errors ?? null

  return (
    <>
      <div className='flex h-full flex-col gap-y-2 overflow-auto px-4'>
        {linearIssues && linearIssues.length > 0 ? (
          linearIssues.map((issue) => {
            if (!issue) {
              return null
            }

            return <LinearObjectCard key={issue.id} issueRef={issue} />
          })
        ) : (
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
