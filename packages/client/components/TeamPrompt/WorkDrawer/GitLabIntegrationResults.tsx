import {Link} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import type {GitLabIntegrationResults_search$key} from '../../../__generated__/GitLabIntegrationResults_search.graphql'
import type {GitLabIntegrationResultsQuery} from '../../../__generated__/GitLabIntegrationResultsQuery.graphql'
import type {GitLabIntegrationResultsSearchPaginationQuery} from '../../../__generated__/GitLabIntegrationResultsSearchPaginationQuery.graphql'
import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import getCaughtErrorMessage from '../../../utils/relay/getCaughtErrorMessage'
import Ellipsis from '../../Ellipsis/Ellipsis'
import GitLabObjectCard from './GitLabObjectCard'

interface Props {
  queryRef: PreloadedQuery<GitLabIntegrationResultsQuery>
  teamId: string
}

const GitLabIntegrationResults = (props: Props) => {
  const {queryRef, teamId} = props
  const query = usePreloadedQuery<GitLabIntegrationResultsQuery>(
    graphql`
      query GitLabIntegrationResultsQuery($teamId: ID!) {
        ...GitLabIntegrationResults_search @arguments(teamId: $teamId)
      }
    `,
    queryRef
  )

  const paginationRes = usePaginationFragment<
    GitLabIntegrationResultsSearchPaginationQuery,
    GitLabIntegrationResults_search$key
  >(
    graphql`
      fragment GitLabIntegrationResults_search on Query
      @argumentDefinitions(
        cursor: {type: "String"}
        count: {type: "Int", defaultValue: 25}
        teamId: {type: "ID!"}
      )
      @refetchable(queryName: "GitLabIntegrationResultsSearchPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              gitlab {
                projectsIssues(
                  first: $count
                  after: $cursor
                  searchQuery: ""
                  state: "opened"
                  sort: "UPDATED_DESC"
                ) @connection(key: "GitLabIntegrationResults_projectsIssues") @catch {
                  edges {
                    node {
                      ... on _xGitLabIssue {
                        id
                        ...GitLabObjectCard_issue @alias
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

  const projectsIssuesResult = data.viewer.teamMember?.integrations.gitlab.projectsIssues
  const projectsIssues = projectsIssuesResult?.ok ? projectsIssuesResult.value : null
  const gitlabResults = projectsIssues?.edges?.map((edge) => edge?.node)
  const errorMessage = getCaughtErrorMessage(projectsIssuesResult)

  return (
    <>
      <div className='flex h-full flex-col gap-y-2 overflow-auto p-4'>
        {gitlabResults && gitlabResults.length > 0 ? (
          gitlabResults?.map((result, idx) => {
            if (!result) {
              return null
            }
            if (!result.GitLabObjectCard_issue) return null
            return <GitLabObjectCard key={idx} issueRef={result.GitLabObjectCard_issue} />
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
              Review your GitLab configuration
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

export default GitLabIntegrationResults
