import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {type PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import {Link} from 'react-router'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import type {GitHubIntegrationResults_search$key} from '../../../__generated__/GitHubIntegrationResults_search.graphql'
import type {GitHubIntegrationResultsQuery} from '../../../__generated__/GitHubIntegrationResultsQuery.graphql'
import type {GitHubIntegrationResultsSearchPaginationQuery} from '../../../__generated__/GitHubIntegrationResultsSearchPaginationQuery.graphql'
import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import Ellipsis from '../../Ellipsis/Ellipsis'
import GitHubObjectCard from './GitHubObjectCard'

interface Props {
  queryRef: PreloadedQuery<GitHubIntegrationResultsQuery>
  queryType: 'issue' | 'pullRequest'
  searchQuery: string
  teamId: string
  onResultCount: (searchQuery: string, count: number) => void
}

const GitHubIntegrationResults = (props: Props) => {
  const {queryRef, queryType, searchQuery, teamId, onResultCount} = props
  const query = usePreloadedQuery(
    graphql`
      query GitHubIntegrationResultsQuery($teamId: ID!, $searchQuery: String!) {
        ...GitHubIntegrationResults_search @arguments(teamId: $teamId)
      }
    `,
    queryRef
  )

  const paginationRes = usePaginationFragment<
    GitHubIntegrationResultsSearchPaginationQuery,
    GitHubIntegrationResults_search$key
  >(
    graphql`
      fragment GitHubIntegrationResults_search on Query
      @argumentDefinitions(
        cursor: {type: "String"}
        count: {type: "Int", defaultValue: 25}
        teamId: {type: "ID!"}
      )
      @refetchable(queryName: "GitHubIntegrationResultsSearchPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              github {
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
                    search(first: $count, after: $cursor, type: ISSUE, query: $searchQuery)
                      @connection(key: "GitHubIntegrationResults_search") {
                      edges {
                        node {
                          __typename
                          ...GitHubObjectCard_result
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
    `,
    query
  )

  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 20)
  const {data, hasNext} = paginationRes

  const github = data.viewer.teamMember?.integrations.github

  const githubResults = github?.api?.query?.search.edges?.map((edge) => edge?.node)
  const errors = github?.api?.errors ?? null

  // Report how many items this search returned so the parent can hide the AI draft UI
  // when there's no work to draft from.
  const resultCount = githubResults?.length ?? 0
  useEffect(() => {
    onResultCount(searchQuery, resultCount)
  }, [searchQuery, resultCount, onResultCount])

  return (
    <>
      <div className='flex flex-col gap-y-2 px-4'>
        {githubResults && githubResults.length > 0 ? (
          githubResults?.map((result, idx) => {
            if (!result) {
              return null
            }
            return <GitHubObjectCard key={idx} resultRef={result} />
          })
        ) : (
          <div className='flex flex-col items-center pt-12'>
            <img className='w-20' src={halloweenRetrospectiveTemplate} />
            {errors?.[0]?.message ? (
              <>
                <div className='mt-7 w-2/3 text-center'>{errors[0].message}</div>
                <Link
                  to={`/team/${teamId}/integrations`}
                  className='mt-4 font-semibold text-accent hover:text-sky-400'
                >
                  Review your GitHub configuration
                </Link>
              </>
            ) : (
              <div className='mt-7 w-2/3 text-center'>
                {`Looks like you don’t have any ${
                  queryType === 'issue' ? 'issues' : 'pull requests'
                } to display. Try adjusting the date range.`}
              </div>
            )}
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

export default GitHubIntegrationResults
