import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {type PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import {Link} from 'react-router'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import type {LinearIntegrationResults_query$key} from '../../../__generated__/LinearIntegrationResults_query.graphql'
import type {LinearIntegrationResultsPaginationQuery} from '../../../__generated__/LinearIntegrationResultsPaginationQuery.graphql'
import type {LinearIntegrationResultsQuery} from '../../../__generated__/LinearIntegrationResultsQuery.graphql'
import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import Ellipsis from '../../Ellipsis/Ellipsis'
import LinearObjectCard from './LinearObjectCard'

interface Props {
  queryRef: PreloadedQuery<LinearIntegrationResultsQuery>
  teamId: string
  searchQuery: string
  onResultCount: (searchQuery: string, count: number) => void
}

const LinearIntegrationResults = (props: Props) => {
  const {queryRef, teamId, searchQuery, onResultCount} = props

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

  // Report how many issues this search returned so the parent can hide the AI draft UI
  // when there's no work to draft from.
  const resultCount = linearIssues?.length ?? 0
  useEffect(() => {
    onResultCount(searchQuery, resultCount)
  }, [searchQuery, resultCount, onResultCount])

  return (
    <>
      <div className='flex flex-col gap-y-2 px-4'>
        {linearIssues && linearIssues.length > 0 ? (
          linearIssues.map((issue) => {
            if (!issue) {
              return null
            }

            return <LinearObjectCard key={issue.id} issueRef={issue} />
          })
        ) : (
          <div className='flex flex-col items-center pt-12 text-center'>
            <img
              className='w-20'
              src={halloweenRetrospectiveTemplate}
              alt='No results illustration'
            />
            <div className='mt-7 w-2/3 text-fg-secondary text-sm'>
              {errors?.[0]?.message
                ? `Error fetching Linear issues: ${errors[0].message}`
                : `Looks like no Linear issues match your filter.`}
            </div>
            <Link
              to={`/team/${teamId}/integrations`}
              className='mt-4 font-semibold text-accent hover:text-sky-400'
            >
              Review Linear integration settings
            </Link>
          </div>
        )}

        {lastItem}

        {hasNext && (
          <div className='-mt-4 mx-auto mb-4 h-8 text-2xl' key={'loadingNext'}>
            <Ellipsis />
          </div>
        )}
      </div>
    </>
  )
}

export default LinearIntegrationResults
