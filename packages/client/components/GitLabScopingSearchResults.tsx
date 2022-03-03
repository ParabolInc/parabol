import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {PreloadedQuery, useFragment, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import useGetUsedServiceTaskIds from '~/hooks/useGetUsedServiceTaskIds'
import useLoadNextOnScrollBottom from '~/hooks/useLoadNextOnScrollBottom'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
// import {GitLabScopingSearchResultsRoot_meeting$key} from '~/__generated__/GitLabScopingSearchResultsRoot_meeting.graphql'
// import useAtmosphere from '../hooks/useAtmosphere'
// import useGetUsedServiceTaskIds from '../hooks/useGetUsedServiceTaskIds'
// import useLoadNextOnScrollBottom from '../hooks/useLoadNextOnScrollBottom'
// import PersistGitLabSearchQueryMutation from '../mutations/PersistGitLabSearchQueryMutation'
// import {SprintPokerDefaults} from '../types/constEnums'
import getNonNullEdges from '../utils/getNonNullEdges'
import {GitLabScopingSearchResultsPaginationQuery} from '../__generated__/GitLabScopingSearchResultsPaginationQuery.graphql'
import {GitLabScopingSearchResultsQuery} from '../__generated__/GitLabScopingSearchResultsQuery.graphql'
import {GitLabScopingSearchResults_meeting$key} from '../__generated__/GitLabScopingSearchResults_meeting.graphql'
import {GitLabScopingSearchResults_query$key} from '../__generated__/GitLabScopingSearchResults_query.graphql'
import Ellipsis from './Ellipsis/Ellipsis'
// import Ellipsis from './Ellipsis/Ellipsis'
import GitLabScopingSearchResultItem from './GitLabScopingSearchResultItem'
import GitLabScopingSelectAllIssues from './GitLabScopingSelectAllIssues'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
// import NewGitLabIssueInput from './NewGitLabIssueInput'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'

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
  queryRef: PreloadedQuery<GitLabScopingSearchResultsQuery>
  meetingRef: GitLabScopingSearchResults_meeting$key
}

const GitLabScopingSearchResults = (props: Props) => {
  const {queryRef, meetingRef} = props
  const query = usePreloadedQuery(
    graphql`
      query GitLabScopingSearchResultsQuery($teamId: ID!) {
        ...GitLabScopingSearchResults_query
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const paginationRes = usePaginationFragment<
    GitLabScopingSearchResultsPaginationQuery,
    GitLabScopingSearchResults_query$key
  >(
    graphql`
      fragment GitLabScopingSearchResults_query on Query
        @argumentDefinitions(
          projectsFirst: {type: "Int", defaultValue: 5}
          issuesFirst: {type: "Int", defaultValue: 25}
          projectsAfter: {type: "String"}
          issuesAfter: {type: "String"}
          search: {type: "String"}
          projectIds: {type: "[ID!]", defaultValue: null}
        )
        @refetchable(queryName: "GitLabScopingSearchResultsPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              gitlab {
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
                    projects(
                      membership: true
                      first: $projectsFirst
                      after: $projectsAfter
                      ids: null # $projectIds
                    ) @connection(key: "GitLabScopingSearchResults_projects") {
                      edges {
                        node {
                          ... on _xGitLabProject {
                            issues(
                              includeSubepics: true
                              state: opened
                              search: $search
                              sort: UPDATED_DESC
                              first: $issuesFirst
                              after: $issuesAfter
                            ) {
                              edges {
                                node {
                                  __typename
                                  ... on _xGitLabIssue {
                                    ...GitLabScopingSearchResultItem_issue
                                    ...GitLabScopingSelectAllIssues_issues
                                    id
                                    descriptionHtml
                                    title
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
        }
      }
    `,
    query
  )

  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 20)
  const {data, hasNext} = paginationRes
  const {viewer} = data
  const meeting = useFragment(
    graphql`
      fragment GitLabScopingSearchResults_meeting on PokerMeeting {
        # ...NewGitLabIssueInput_meeting
        id
        teamId
        # gitlabSearchQuery {
        #   queryString
        # }
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
  // const {queryString} = gitlabSearchQuery
  const errors = gitlab?.api?.errors ?? null
  const nullableEdges = gitlab?.api?.query?.projects?.edges?.flatMap(
    (project) => project?.node?.issues?.edges ?? null
  )
  const issues = nullableEdges
    ? getNonNullEdges(nullableEdges)
        .filter((edge) => edge.node.__typename === '_xGitLabIssue')
        .map(({node}) => node)
    : null
  const [isEditing, setIsEditing] = useState(false)
  // const atmosphere = useAtmosphere()
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const handleAddIssueClick = () => setIsEditing(true)

  // even though it's a little herky jerky, we need to give the user feedback that a search is pending
  // TODO fix flicker after viewer is present but edges isn't set
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
      {
        <GitLabScopingSelectAllIssues
          usedServiceTaskIds={usedServiceTaskIds}
          issuesRef={issues}
          meetingId={meetingId}
        />
      }
      <ResultScroller>
        {/* {query && (
          <NewGitLabIssueInput
            isEditing={isEditing}
            meetingRef={meeting}
            setIsEditing={setIsEditing}
            viewerRef={query.viewer}
          />
        )} */}
        {issues.map((issue) => (
          <GitLabScopingSearchResultItem
            key={issue.id}
            issueRef={issue}
            meetingId={meetingId}
            usedServiceTaskIds={usedServiceTaskIds}
            // persistQuery={persistQuery}
          />
        ))}
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

export default GitLabScopingSearchResults
