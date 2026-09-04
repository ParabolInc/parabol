import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {
  type PreloadedQuery,
  useFragment,
  usePaginationFragment,
  usePreloadedQuery
} from 'react-relay'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import type {GitHubScopingSearchResults_meeting$key} from '../__generated__/GitHubScopingSearchResults_meeting.graphql'
import type {GitHubScopingSearchResults_query$key} from '../__generated__/GitHubScopingSearchResults_query.graphql'
import type {GitHubScopingSearchResultsPaginationQuery} from '../__generated__/GitHubScopingSearchResultsPaginationQuery.graphql'
import type {GitHubScopingSearchResultsQuery} from '../__generated__/GitHubScopingSearchResultsQuery.graphql'
import useGetUsedServiceTaskIds from '../hooks/useGetUsedServiceTaskIds'
import useLoadNextOnScrollBottom from '../hooks/useLoadNextOnScrollBottom'
import findIntegrationService from '../integrations/platform/findIntegrationService'
import usePersistIntegrationSearchQueryMutation from '../mutations/usePersistIntegrationSearchQueryMutation'
import GitHubIssueId from '../shared/gqlIds/GitHubIssueId'
import {SprintPokerDefaults} from '../types/constEnums'
import type {GQLType} from '../types/generics'
import getNonNullEdges from '../utils/getNonNullEdges'
import {gitHubQueryValidation} from '../validation/gitHubQueryValidation'
import Ellipsis from './Ellipsis/Ellipsis'
import GitHubScopingSelectAllIssues from './GitHubScopingSelectAllIssues'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import NewGitHubIssueInput from './NewGitHubIssueInput'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'
import ScopingSearchResultItem from './ScopingSearchResultItem'

interface Props {
  queryRef: PreloadedQuery<GitHubScopingSearchResultsQuery>
  meetingRef: GitHubScopingSearchResults_meeting$key
}

const GitHubScopingSearchResults = (props: Props) => {
  const {queryRef, meetingRef} = props
  const query = usePreloadedQuery<GitHubScopingSearchResultsQuery>(
    graphql`
      query GitHubScopingSearchResultsQuery($teamId: ID!, $queryString: String!) {
        ...GitHubScopingSearchResults_query
        viewer {
          ...NewGitHubIssueInput_viewer
          teamMember(teamId: $teamId) {
            services {
              ...findIntegrationService_auth @relay(mask: false)
              ...usePersistIntegrationSearchQueryMutation_service @relay(mask: false)
            }
            repoIntegrations(first: 20, networkOnly: false) {
              items {
                ... on _xGitHubRepository {
                  id
                  nameWithOwner
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  )

  const paginationRes = usePaginationFragment<
    GitHubScopingSearchResultsPaginationQuery,
    GitHubScopingSearchResults_query$key
  >(
    graphql`
      fragment GitHubScopingSearchResults_query on Query
      @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 25})
      @refetchable(queryName: "GitHubScopingSearchResultsPaginationQuery") {
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
                    search(first: $count, after: $cursor, type: ISSUE, query: $queryString)
                      @connection(key: "GitHubScopingSearchResults_search") {
                      edges {
                        node {
                          __typename
                          ... on _xGitHubIssue {
                            ...GitHubScopingSelectAllIssues_issues
                            id
                            title
                            number
                            repository {
                              nameWithOwner
                            }
                            url
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
    `,
    query
  )
  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 20)
  const {data, hasNext} = paginationRes
  const meeting = useFragment(
    graphql`
      fragment GitHubScopingSearchResults_meeting on PokerMeeting {
        ...NewGitHubIssueInput_meeting
        id
        teamId
        githubSearchQuery {
          queryString
        }
        phases {
          ...useGetUsedServiceTaskIds_phase
          phaseType
        }
      }
    `,
    meetingRef
  )
  const {viewer} = data
  const teamMember = viewer.teamMember!
  const {integrations} = teamMember
  const {github} = integrations
  const {id: meetingId, githubSearchQuery, teamId, phases} = meeting
  const {queryString} = githubSearchQuery
  const errors = github?.api?.errors ?? null
  const nullableEdges = github?.api?.query?.search?.edges ?? null
  const issues = nullableEdges
    ? getNonNullEdges(nullableEdges)
        .filter((edge) => edge.node.__typename === '_xGitHubIssue')
        .map(({node}) => node as GQLType<typeof node, '_xGitHubIssue'>)
    : null
  const [isEditing, setIsEditing] = useState(false)
  const [persistIntegrationSearchQuery] = usePersistIntegrationSearchQueryMutation()
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const handleAddIssueClick = () => setIsEditing(true)

  const errorMessage = gitHubQueryValidation(queryString) ?? errors?.[0]?.message ?? undefined
  const noResults = (
    <>
      <IntegrationScopingNoResults error={errorMessage} msg={'No issues match that query'} />
      <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
    </>
  )
  if (!issues) return errorMessage ? noResults : <MockScopingList />
  if (issues.length === 0 && !isEditing) return noResults
  const persistQuery = () => {
    // don't persist empty
    if (!queryString) return
    const normalizedQueryString = queryString.toLowerCase().trim()
    // don't persist default
    if (normalizedQueryString === SprintPokerDefaults.GITHUB_DEFAULT_QUERY) return
    const queryTeamMember = query.viewer.teamMember
    if (!queryTeamMember) return
    const githubService = findIntegrationService(queryTeamMember.services, 'github')
    const providerId = githubService?.auth?.providerId
    if (!providerId) return
    const searchHashes = githubService.searchQueries.map(({queryString}) => queryString)
    const isQueryNew = !searchHashes.includes(normalizedQueryString)
    if (isQueryNew) {
      persistIntegrationSearchQuery({
        variables: {
          teamId,
          providerId,
          queryString: normalizedQueryString
        }
      })
    }
  }
  return (
    <>
      <GitHubScopingSelectAllIssues
        usedServiceTaskIds={usedServiceTaskIds}
        issuesRef={issues}
        meetingId={meetingId}
        persistQuery={persistQuery}
      />
      <div className='overflow-auto'>
        {query && (
          <NewGitHubIssueInput
            isEditing={isEditing}
            meetingRef={meeting}
            setIsEditing={setIsEditing}
            viewerRef={query.viewer}
          />
        )}
        {issues.map((node) => {
          const {repository, number, title, url} = node
          const {nameWithOwner} = repository
          const linkText = `#${number} ${nameWithOwner}`
          return (
            <ScopingSearchResultItem
              key={node.id}
              service={'github'}
              usedServiceTaskIds={usedServiceTaskIds}
              serviceTaskId={GitHubIssueId.join(nameWithOwner, number)}
              meetingId={meetingId}
              persistQuery={persistQuery}
              summary={title}
              url={url}
              linkText={linkText}
              linkTitle={linkText}
            />
          )
        })}
        {lastItem}
        {hasNext && (
          <div className='flex h-8 w-full justify-center text-2xl' key={'loadingNext'}>
            <Ellipsis />
          </div>
        )}
      </div>
      {!isEditing && (
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      )}
    </>
  )
}

export default GitHubScopingSearchResults
