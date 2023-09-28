import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {
  PreloadedQuery,
  useFragment,
  // usePaginationFragment,
  usePreloadedQuery
} from 'react-relay'
import {JiraIntegrationResultsQuery} from '../../../__generated__/JiraIntegrationResultsQuery.graphql'
// import {JiraIntegrationResultsSearchPaginationQuery} from '../../../__generated__/JiraIntegrationResultsSearchPaginationQuery.graphql'
import {
  // JiraIntegrationResults_search$key,
  JiraIntegrationResults_search$data
} from '../../../__generated__/JiraIntegrationResults_search.graphql'
// import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import JiraObjectCard from './JiraObjectCard'
// import Ellipsis from '../../Ellipsis/Ellipsis'

interface Props {
  queryRef: PreloadedQuery<JiraIntegrationResultsQuery>
}

const JiraIntegrationResults = (props: Props) => {
  const {queryRef} = props
  const query = usePreloadedQuery(
    graphql`
      query JiraIntegrationResultsQuery($teamId: ID!) {
        ...JiraIntegrationResults_search @arguments(teamId: $teamId)
      }
    `,
    queryRef
  )

  //   const paginationRes = usePaginationFragment<
  //   JiraIntegrationResultsSearchPaginationQuery,
  //   JiraIntegrationResults_search$key
  // >(
  const queryFrag = useFragment(
    graphql`
      fragment JiraIntegrationResults_search on Query
      @argumentDefinitions(
        # cursor: {type: "String"}
        # count: {type: "Int", defaultValue: 25}
        teamId: {type: "ID!"}
      ) {
        # @refetchable(queryName: "JiraIntegrationResultsSearchPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              atlassian {
                issues(first: 10, isJQL: false)
                  # first: $first
                  # queryString: $queryString
                  # isJQL: $isJQL
                  # projectKeyFilters: $projectKeyFilters
                  @connection(key: "JiraScopingSearchResults_issues") {
                  error {
                    message
                  }
                  edges {
                    node {
                      ...JiraObjectCard_result
                      id
                      summary
                      url
                      issueKey
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

  // const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 20)
  // const {data, hasNext} = paginationRes

  // const github = data.viewer.teamMember?.integrations.github

  // const githubResults = github?.api?.query?.search.edges?.map((edge) => edge?.node)
  const jiraResults = (
    queryFrag as JiraIntegrationResults_search$data
  ).viewer.teamMember?.integrations.atlassian?.issues.edges.map((edge) => edge.node)

  // const errors = github?.api?.errors ?? null

  return (
    <>
      <div className='flex flex h-full flex-col gap-y-2 overflow-auto p-4'>
        {jiraResults && jiraResults.length > 0 ? (
          jiraResults?.map((result, idx) => {
            if (!result) {
              return null
            }
            // return <div key={result.id}>{result.summary}</div>
            return <JiraObjectCard key={idx} resultRef={result} />
          })
        ) : (
          <div className='-mt-14 flex h-full flex-col items-center justify-center'>
            <img className='w-20' src={halloweenRetrospectiveTemplate} />
            <div className='mt-7 w-2/3 text-center'>
              {/* {errors?.[0]?.message
                ? errors?.[0]?.message
                : `Looks like you don’t have any ${
                    queryType === 'issue' ? 'issues' : 'pull requests'
                  } to display.`} */}
            </div>
          </div>
        )}
        {/* {lastItem}
        {hasNext && (
          <div className='mx-auto mb-4 -mt-4 h-8 text-2xl' key={'loadingNext'}>
            <Ellipsis />
          </div>
        )} */}
      </div>
    </>
  )
}

export default JiraIntegrationResults
