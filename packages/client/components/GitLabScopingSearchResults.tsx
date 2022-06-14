import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {PreloadedQuery, useFragment, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import useGetUsedServiceTaskIds from '~/hooks/useGetUsedServiceTaskIds'
import useLoadNextOnScrollBottom from '~/hooks/useLoadNextOnScrollBottom'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import GitLabIssueId from '../shared/gqlIds/GitLabIssueId'
import getNonNullEdges from '../utils/getNonNullEdges'
import {parseWebPath} from '../utils/parseWebPath'
import {GitLabScopingSearchResultsPaginationQuery} from '../__generated__/GitLabScopingSearchResultsPaginationQuery.graphql'
import {GitLabScopingSearchResultsQuery} from '../__generated__/GitLabScopingSearchResultsQuery.graphql'
import {GitLabScopingSearchResults_meeting$key} from '../__generated__/GitLabScopingSearchResults_meeting.graphql'
import {GitLabScopingSearchResults_query$key} from '../__generated__/GitLabScopingSearchResults_query.graphql'
import Ellipsis from './Ellipsis/Ellipsis'
import GitLabScopingSelectAllIssues from './GitLabScopingSelectAllIssues'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import NewGitLabIssueInput from './NewGitLabIssueInput'
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
        $selectedProjectsIds: [ID!]
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
    GitLabScopingSearchResultsPaginationQuery,
    GitLabScopingSearchResults_query$key
  >(
    graphql`
      fragment GitLabScopingSearchResults_query on Query
      @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 25})
      @refetchable(queryName: "GitLabScopingSearchResultsPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              gitlab {
                projectsIssues(
                  projectsIds: $selectedProjectsIds
                  first: $count
                  after: $cursor
                  searchQuery: $queryString
                  state: $state
                  sort: $sort
                ) @connection(key: "GitLabScopingSearchResults_projectsIssues") {
                  error {
                    message
                  }
                  edges {
                    node {
                      ... on _xGitLabIssue {
                        ...GitLabScopingSelectAllIssues_issues
                        id
                        iid
                        title
                        webPath
                        webUrl
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
  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 25)
  const {hasNext, data} = paginationRes
  const projectsIssues = data.viewer.teamMember?.integrations.gitlab.projectsIssues
  const nullableEdges = projectsIssues?.edges
  const errorMessage = projectsIssues?.error?.message ?? null

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
  const {viewer} = query
  const teamMember = viewer.teamMember!
  const {integrations} = teamMember
  const {gitlab} = integrations
  const {id: meetingId, phases} = meeting
  const providerId = gitlab.auth!.provider.id
  const issues = nullableEdges ? getNonNullEdges(nullableEdges).map(({node}) => node) : null
  const [isEditing, setIsEditing] = useState(false)
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const handleAddIssueClick = () => setIsEditing(true)

  if (!issues) return <MockScopingList />
  if (issues.length === 0 && !isEditing) {
    return (
      <>
        <IntegrationScopingNoResults error={errorMessage} msg={'No issues match that query'} />
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
        {issues.map((issue) => {
          const {id, iid, title, webUrl, webPath} = issue
          const {fullPath} = parseWebPath(webPath ?? '')
          const linkText = `#${iid} ${fullPath}`

          return (
            <ScopingSearchResultItem
              key={id}
              service={'gitlab'}
              usedServiceTaskIds={usedServiceTaskIds}
              serviceTaskId={GitLabIssueId.join(providerId, id ?? '')}
              meetingId={meetingId}
              summary={title ?? ''}
              url={webUrl ?? ''}
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

export default GitLabScopingSearchResults
