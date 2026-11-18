import {Link} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import type {JiraServerIntegrationResults_search$key} from '../../../__generated__/JiraServerIntegrationResults_search.graphql'
import type {JiraServerIntegrationResultsQuery} from '../../../__generated__/JiraServerIntegrationResultsQuery.graphql'
import type {JiraServerIntegrationResultsSearchPaginationQuery} from '../../../__generated__/JiraServerIntegrationResultsSearchPaginationQuery.graphql'
import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import getCaughtErrorMessage from '../../../utils/relay/getCaughtErrorMessage'
import Ellipsis from '../../Ellipsis/Ellipsis'
import JiraServerObjectCard from './JiraServerObjectCard'

interface Props {
  queryRef: PreloadedQuery<JiraServerIntegrationResultsQuery>
  teamId: string
}

const JiraServerIntegrationResults = (props: Props) => {
  const {queryRef, teamId} = props
  const query = usePreloadedQuery<JiraServerIntegrationResultsQuery>(
    graphql`
      query JiraServerIntegrationResultsQuery($teamId: ID!) {
        ...JiraServerIntegrationResults_search @arguments(teamId: $teamId)
      }
    `,
    queryRef
  )

  const paginationRes = usePaginationFragment<
    JiraServerIntegrationResultsSearchPaginationQuery,
    JiraServerIntegrationResults_search$key
  >(
    graphql`
      fragment JiraServerIntegrationResults_search on Query
      @argumentDefinitions(
        cursor: {type: "String"}
        count: {type: "Int", defaultValue: 20}
        teamId: {type: "ID!"}
      )
      @refetchable(queryName: "JiraServerIntegrationResultsSearchPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              jiraServer {
                issues(
                  first: $count
                  after: $cursor
                  isJQL: true
                  queryString: "assignee = currentUser() order by updated DESC"
                ) @connection(key: "JiraServerScopingSearchResults_issues") @catch {
                  edges {
                    node {
                      ...JiraServerObjectCard_result
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

  const issuesResult = data.viewer.teamMember?.integrations.jiraServer.issues
  const issues = issuesResult?.ok ? issuesResult.value : null
  const jiraResults = issues?.edges.map((edge) => edge.node)
  const errorMessage = getCaughtErrorMessage(issuesResult)

  return (
    <>
      <div className='flex h-full flex-col gap-y-2 overflow-auto p-4'>
        {jiraResults && jiraResults.length > 0 ? (
          jiraResults?.map((result, idx) => {
            if (!result) {
              return null
            }
            return <JiraServerObjectCard key={idx} resultRef={result} />
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
              Review your Jira Data Center configuration
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

export default JiraServerIntegrationResults
