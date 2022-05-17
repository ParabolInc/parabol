import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {PreloadedQuery, useFragment, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import useGetUsedServiceTaskIds from '~/hooks/useGetUsedServiceTaskIds'
import useLoadNextOnScrollBottom from '~/hooks/useLoadNextOnScrollBottom'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import getNonNullEdges from '../utils/getNonNullEdges'
import {GitLabScopingSearchResultsQuery} from '../__generated__/GitLabScopingSearchResultsQuery.graphql'
import {GitLabScopingSearchResults_meeting$key} from '../__generated__/GitLabScopingSearchResults_meeting.graphql'
import GitLabScopingSearchResultItem from './GitLabScopingSearchResultItem'
import GitLabScopingSelectAllIssues from './GitLabScopingSelectAllIssues'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import NewGitLabIssueInput from './NewGitLabIssueInput'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

interface Props {
  queryRef: PreloadedQuery<GitLabScopingSearchResultsQuery>
  meetingRef: GitLabScopingSearchResults_meeting$key
}

const GitLabScopingSearchResults = (props: Props) => {
  const {queryRef, meetingRef} = props

  const query = usePreloadedQuery(
    graphql`
      query GitLabScopingSearchResultsQuery(
        $teamId: ID!
        $queryString: String!
        # $selectedProjectsIds: [ID!]
        $first: Int!
        $includeSubepics: Boolean!
        $sort: _xGitLabIssueSort!
        $state: _xGitLabIssuableState!
      ) {
        ...GitLabScopingSearchResults_query
        viewer {
          ...NewGitLabIssueInput_viewer
          teamMember(teamId: $teamId) {
            integrations {
              gitlab {
                auth {
                  provider {
                    id
                  }
                }
                # projectIssues(first: 10) @connection(key: "GitLabScopingSearchResults_issues") {
                #   edges {
                #     node {
                #       ... on _xGitLabIssue {
                #         id
                #       }
                #     }
                #   }
                # }
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
                    project(fullPath: "testa-group/test-project") {
                      ... on _xGitLabProject {
                        issues(
                          includeSubepics: $includeSubepics
                          state: $state
                          search: $queryString
                          sort: $sort
                          first: $first
                        ) {
                          edges {
                            node {
                              ... on _xGitLabIssue {
                                ...GitLabScopingSearchResultItem_issue
                                ...GitLabScopingSelectAllIssues_issues
                                id
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
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const paginationRes = usePaginationFragment(
    graphql`
      fragment GitLabScopingSearchResults_query on Query
      @argumentDefinitions(cursor: {type: "DateTime"}, count: {type: "Int", defaultValue: 4})
      @refetchable(queryName: "GitLabScopingSearchResultsPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              gitlab {
                projectIssues(first: $count, after: $cursor)
                  @connection(key: "GitLabScopingSearchResults_projectIssues") {
                  edges {
                    node {
                      ... on _xGitLabIssue {
                        id
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
  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 12)
  const {viewer} = query
  console.log('🚀  ~ query', {query, paginationRes})
  const meeting = useFragment(
    graphql`
      fragment GitLabScopingSearchResults_meeting on PokerMeeting {
        id
        teamId
        phases {
          ...useGetUsedServiceTaskIds_phase
          phaseType
        }
      }
    `,
    meetingRef
  )
  const teamMember = viewer.teamMember!
  const {integrations} = teamMember
  const {gitlab} = integrations
  const {id: meetingId, phases} = meeting
  const errors = gitlab?.api?.errors ?? null
  const providerId = gitlab.auth!.provider.id
  console.log('🚀  ~ gitlab', gitlab)
  const nullableEdges = gitlab?.api?.query?.project?.issues?.edges ?? null
  const issues = nullableEdges ? getNonNullEdges(nullableEdges).map(({node}) => node) : null
  const [isEditing, setIsEditing] = useState(false)
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const handleAddIssueClick = () => setIsEditing(true)

  if (!issues) return <MockScopingList />
  if (issues.length === 0 && !isEditing) {
    return (
      <>
        <IntegrationScopingNoResults
          error={errors?.[0]?.message}
          msg={'No issues match that query'}
        />
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      </>
    )
  }
  return (
    <>
      <GitLabScopingSelectAllIssues
        usedServiceTaskIds={usedServiceTaskIds}
        issuesRef={issues}
        meetingId={meetingId}
        providerId={providerId}
      />
      <ResultScroller>
        {query && (
          <NewGitLabIssueInput
            isEditing={isEditing}
            meetingId={meetingId}
            setIsEditing={setIsEditing}
            viewerRef={viewer}
          />
        )}
        {issues.map((issue) => (
          <GitLabScopingSearchResultItem
            key={issue.id}
            issueRef={issue}
            meetingId={meetingId}
            usedServiceTaskIds={usedServiceTaskIds}
            providerId={providerId}
          />
        ))}
      </ResultScroller>
      {lastItem}
      {!isEditing && (
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      )}
    </>
  )
}

export default GitLabScopingSearchResults
