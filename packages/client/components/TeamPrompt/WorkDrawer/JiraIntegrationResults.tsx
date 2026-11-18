import {Link} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {type PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import type {JiraIntegrationResults_search$key} from '../../../__generated__/JiraIntegrationResults_search.graphql'
import type {JiraIntegrationResultsQuery} from '../../../__generated__/JiraIntegrationResultsQuery.graphql'
import type {JiraIntegrationResultsSearchPaginationQuery} from '../../../__generated__/JiraIntegrationResultsSearchPaginationQuery.graphql'
import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import getCaughtErrorMessage from '../../../utils/relay/getCaughtErrorMessage'
import Ellipsis from '../../Ellipsis/Ellipsis'
import JiraObjectCard from './JiraObjectCard'

interface Props {
  queryRef: PreloadedQuery<JiraIntegrationResultsQuery>
  teamId: string
  searchQuery: string
  onResultCount: (searchQuery: string, count: number) => void
}

const JiraIntegrationResults = (props: Props) => {
  const {queryRef, teamId, searchQuery, onResultCount} = props
  const query = usePreloadedQuery<JiraIntegrationResultsQuery>(
    graphql`
      query JiraIntegrationResultsQuery($teamId: ID!, $searchQuery: String!) {
        ...JiraIntegrationResults_search @arguments(teamId: $teamId)
      }
    `,
    queryRef
  )

  const paginationRes = usePaginationFragment<
    JiraIntegrationResultsSearchPaginationQuery,
    JiraIntegrationResults_search$key
  >(
    graphql`
      fragment JiraIntegrationResults_search on Query
      @argumentDefinitions(
        cursor: {type: "String"}
        count: {type: "Int", defaultValue: 20}
        teamId: {type: "ID!"}
      )
      @refetchable(queryName: "JiraIntegrationResultsSearchPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              atlassian {
                issues(
                  first: $count
                  after: $cursor
                  isJQL: true
                  queryString: $searchQuery
                ) @connection(key: "JiraScopingSearchResults_issues") @catch {
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

  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 20)
  const {data, hasNext} = paginationRes

  const issuesResult = data.viewer.teamMember?.integrations.atlassian?.issues
  const issues = issuesResult?.ok ? issuesResult.value : null
  const jiraResults = issues?.edges.map((edge) => edge.node)
  const errorMessage = getCaughtErrorMessage(issuesResult)

  // Report how many issues this search returned so the parent can hide the AI draft UI
  // when there's no work to draft from.
  const resultCount = jiraResults?.length ?? 0
  useEffect(() => {
    onResultCount(searchQuery, resultCount)
  }, [searchQuery, resultCount, onResultCount])

  return (
    <>
      <div className='flex flex-col gap-y-2 p-4'>
        {jiraResults && jiraResults.length > 0 ? (
          jiraResults?.map((result, idx) => {
            if (!result) {
              return null
            }
            return <JiraObjectCard key={idx} resultRef={result} />
          })
        ) : (
          <div className='flex flex-col items-center pt-12'>
            <img className='w-20' src={halloweenRetrospectiveTemplate} />
            <div className='mt-7 w-2/3 text-center'>
              {errorMessage ?? `Looks like you don’t have any issues to display.`}
            </div>
            <Link
              to='/team/$teamId/integrations'
              params={{teamId}}
              className='mt-4 font-semibold text-accent hover:text-sky-400'
            >
              Review your Jira configuration
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

export default JiraIntegrationResults
