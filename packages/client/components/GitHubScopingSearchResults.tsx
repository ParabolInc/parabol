import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {PreloadedQuery, useFragment, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import useAtmosphere from '../hooks/useAtmosphere'
import useGetUsedServiceTaskIds from '../hooks/useGetUsedServiceTaskIds'
import useLoadNextOnScrollBottom from '../hooks/useLoadNextOnScrollBottom'
import PersistGitHubSearchQueryMutation from '../mutations/PersistGitHubSearchQueryMutation'
import GitHubIssueId from '../shared/gqlIds/GitHubIssueId'
import {SprintPokerDefaults} from '../types/constEnums'
import {GQLType} from '../types/generics'
import getNonNullEdges from '../utils/getNonNullEdges'
import {gitHubQueryValidation} from '../validation/gitHubQueryValidation'
import {GitHubScopingSearchResultsPaginationQuery} from '../__generated__/GitHubScopingSearchResultsPaginationQuery.graphql'
import {GitHubScopingSearchResultsQuery} from '../__generated__/GitHubScopingSearchResultsQuery.graphql'
import {GitHubScopingSearchResults_meeting$key} from '../__generated__/GitHubScopingSearchResults_meeting.graphql'
import {GitHubScopingSearchResults_query$key} from '../__generated__/GitHubScopingSearchResults_query.graphql'
import Ellipsis from './Ellipsis/Ellipsis'
import GitHubScopingSelectAllIssues from './GitHubScopingSelectAllIssues'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import NewGitHubIssueInput from './NewGitHubIssueInput'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'
import ScopingSearchResultItem from './ScopingSearchResultItem'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

const LoadingNext = styled('div')({
  display: 'flex',
  height: 32,
  fontSize: 24,
  justifyContent: 'center',
  width: '100%'
})
interface Props {
  queryRef: PreloadedQuery<GitHubScopingSearchResultsQuery>
  meetingRef: GitHubScopingSearchResults_meeting$key
}

const GitHubScopingSearchResults = (props: Props) => {
  const {queryRef, meetingRef} = props
  const query = usePreloadedQuery(
    graphql`
      query GitHubScopingSearchResultsQuery($teamId: ID!, $queryString: String!) {
        ...GitHubScopingSearchResults_query
        viewer {
          ...NewGitHubIssueInput_viewer
          teamMember(teamId: $teamId) {
            repoIntegrations {
              items {
                ... on _xGitHubRepository {
                  id
                  nameWithOwner
                }
              }
            }
            integrations {
              github {
                githubSearchQueries {
                  queryString
                }
              }
            }
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
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
  const atmosphere = useAtmosphere()
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const handleAddIssueClick = () => setIsEditing(true)

  // even though it's a little herky jerky, we need to give the user feedback that a search is pending
  // TODO fix flicker after viewer is present but edges isn't set
  if (!issues) return <MockScopingList />
  if (issues.length === 0 && !isEditing) {
    const invalidQuery = gitHubQueryValidation(queryString)
    return (
      <>
        <IntegrationScopingNoResults
          error={invalidQuery || errors?.[0]?.message}
          msg={'No issues match that query'}
        />
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      </>
    )
  }
  const persistQuery = () => {
    // don't persist empty
    if (!queryString) return
    const normalizedQueryString = queryString.toLowerCase().trim()
    // don't persist default
    if (normalizedQueryString === SprintPokerDefaults.GITHUB_DEFAULT_QUERY) return
    const githubSearchQueries =
      query.viewer.teamMember?.integrations.github?.githubSearchQueries ?? []
    const searchHashes = githubSearchQueries.map(({queryString}) => queryString)
    const isQueryNew = !searchHashes.includes(normalizedQueryString)
    if (isQueryNew) {
      PersistGitHubSearchQueryMutation(atmosphere, {
        teamId,
        queryString: normalizedQueryString
      })
    }
  }
  return (
    <>
      <GitHubScopingSelectAllIssues
        usedServiceTaskIds={usedServiceTaskIds}
        issuesRef={issues}
        meetingId={meetingId}
      />
      <ResultScroller>
        {query && (
          <NewGitHubIssueInput
            isEditing={isEditing}
            meetingRef={meeting}
            setIsEditing={setIsEditing}
            viewerRef={query.viewer}
          />
        )}
        {issues.map((node) => {
          const {repository, number} = node
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
              summary={node.title}
              url={node.url}
              linkText={linkText}
              linkTitle={linkText}
            />
          )
        })}
        {lastItem}
        {hasNext && (
          <LoadingNext key={'loadingNext'}>
            <Ellipsis />
          </LoadingNext>
        )}
      </ResultScroller>
      {!isEditing && (
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      )}
    </>
  )
}

export default GitHubScopingSearchResults
