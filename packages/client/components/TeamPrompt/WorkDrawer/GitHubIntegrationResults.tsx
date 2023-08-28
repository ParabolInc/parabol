import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import {GitHubIntegrationResultsQuery} from '../../../__generated__/GitHubIntegrationResultsQuery.graphql'
import {GitHubIntegrationResultsSearchPaginationQuery} from '../../../__generated__/GitHubIntegrationResultsSearchPaginationQuery.graphql'
import {GitHubIntegrationResults_search$key} from '../../../__generated__/GitHubIntegrationResults_search.graphql'
import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import GitHubObjectCard from './GitHubObjectCard'
import Ellipsis from '../../Ellipsis/Ellipsis'

interface Props {
  queryRef: PreloadedQuery<GitHubIntegrationResultsQuery>
  queryType: 'issue' | 'pullRequest'
}

const GitHubIntegrationResults = (props: Props) => {
  const {queryRef, queryType} = props
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

  return (
    <>
      <div className='flex flex h-full flex-col gap-y-2 overflow-auto px-4'>
        {githubResults && githubResults.length > 0 ? (
          githubResults?.map((result, idx) => {
            if (!result) {
              return null
            }
            return <GitHubObjectCard key={idx} resultRef={result} />
          })
        ) : (
          <div className='-mt-14 flex h-full flex-col items-center justify-center'>
            <img className='w-20' src={halloweenRetrospectiveTemplate} />
            <div className='mt-7 w-2/3 text-center'>
              {errors?.[0]?.message
                ? errors?.[0]?.message
                : `Looks like you don’t have any ${
                    queryType === 'issue' ? 'issues' : 'pull requests'
                  } to display.`}
            </div>
          </div>
        )}
        {lastItem}
        {hasNext && (
          <div className='mx-auto mb-4 -mt-4 h-8 text-2xl' key={'loadingNext'}>
            <Ellipsis />
          </div>
        )}
      </div>
    </>
  )
}

export default GitHubIntegrationResults
