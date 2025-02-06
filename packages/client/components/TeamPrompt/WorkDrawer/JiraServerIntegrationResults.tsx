import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import {Link} from 'react-router-dom'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import {JiraServerIntegrationResultsQuery} from '../../../__generated__/JiraServerIntegrationResultsQuery.graphql'
import {JiraServerIntegrationResultsSearchPaginationQuery} from '../../../__generated__/JiraServerIntegrationResultsSearchPaginationQuery.graphql'
import {JiraServerIntegrationResults_search$key} from '../../../__generated__/JiraServerIntegrationResults_search.graphql'
import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import Ellipsis from '../../Ellipsis/Ellipsis'
import JiraServerObjectCard from './JiraServerObjectCard'

interface Props {
  queryRef: PreloadedQuery<JiraServerIntegrationResultsQuery>
  teamId: string
}

const JiraServerIntegrationResults = (props: Props) => {
  const {queryRef, teamId} = props
  const query = usePreloadedQuery(
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
                ) @connection(key: "JiraServerScopingSearchResults_issues") {
                  error {
                    message
                  }
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

  const jira = data.viewer.teamMember?.integrations.jiraServer
  const jiraResults = jira?.issues.edges.map((edge) => edge.node)
  const error = jira?.issues.error ?? null

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
          <div className='-mt-14 flex h-full flex-col items-center justify-center'>
            <img className='w-20' src={halloweenRetrospectiveTemplate} />
            <div className='mt-7 w-2/3 text-center'>
              {error?.message ? error.message : `Looks like you don’t have any issues to display.`}
            </div>
            <Link
              to={`/team/${teamId}/integrations`}
              className='mt-4 font-semibold text-sky-500 hover:text-sky-400'
            >
              Review your Jira Data Center configuration
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

export default JiraServerIntegrationResults
