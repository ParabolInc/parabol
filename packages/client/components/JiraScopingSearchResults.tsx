import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer, PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useGetUsedServiceTaskIds from '~/hooks/useGetUsedServiceTaskIds'
import useAtmosphere from '../hooks/useAtmosphere'
import PersistJiraSearchQueryMutation from '../mutations/PersistJiraSearchQueryMutation'
import {JiraScopingSearchResultsQuery} from '../__generated__/JiraScopingSearchResultsQuery.graphql'
import {JiraScopingSearchResults_meeting} from '../__generated__/JiraScopingSearchResults_meeting.graphql'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import JiraScopingSelectAllIssues from './JiraScopingSelectAllIssues'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'
import NewJiraIssueInput from './NewJiraIssueInput'
import ScopingSearchResultItem from './ScopingSearchResultItem'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

interface Props {
  queryRef: PreloadedQuery<JiraScopingSearchResultsQuery>
  meeting: JiraScopingSearchResults_meeting
}

const query = graphql`
  query JiraScopingSearchResultsQuery(
    $teamId: ID!
    $queryString: String
    $isJQL: Boolean!
    $projectKeyFilters: [ID!]
    $first: Int
  ) {
    viewer {
      ...NewJiraIssueInput_viewer
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            jiraSearchQueries {
              isJQL
              queryString
              projectKeyFilters
            }
            issues(
              first: $first
              queryString: $queryString
              isJQL: $isJQL
              projectKeyFilters: $projectKeyFilters
            ) @connection(key: "JiraScopingSearchResults_issues") {
              error {
                message
              }
              edges {
                ...JiraScopingSelectAllIssues_issues
                node {
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
`

const JiraScopingSearchResults = (props: Props) => {
  const {queryRef, meeting} = props
  const data = usePreloadedQuery<JiraScopingSearchResultsQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const atlassian = viewer?.teamMember!.integrations.atlassian ?? null
  const issues = atlassian?.issues ?? null
  const edges = issues?.edges ?? null
  const error = issues?.error ?? null
  const [isEditing, setIsEditing] = useState(false)
  const atmosphere = useAtmosphere()
  const {id: meetingId, teamId, phases, jiraSearchQuery} = meeting
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const handleAddIssueClick = () => setIsEditing(true)

  if (!edges) {
    return null
  }
  if (edges.length === 0 && !isEditing) {
    return (
      <>
        <IntegrationScopingNoResults error={error?.message} msg={'No issues match that query'} />
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      </>
    )
  }

  const persistQuery = () => {
    const {queryString, isJQL} = jiraSearchQuery
    // don't persist an empty string (the default)
    if (!queryString) return
    const projectKeyFilters = jiraSearchQuery.projectKeyFilters as string[]
    projectKeyFilters.sort()
    const lookupKey = JSON.stringify({queryString, projectKeyFilters})
    const {jiraSearchQueries} = atlassian!
    const searchHashes = jiraSearchQueries.map(({queryString, projectKeyFilters}) => {
      return JSON.stringify({queryString, projectKeyFilters})
    })
    const isQueryNew = !searchHashes.includes(lookupKey)
    if (isQueryNew) {
      PersistJiraSearchQueryMutation(atmosphere, {
        teamId,
        input: {queryString, isJQL, projectKeyFilters: projectKeyFilters as string[]}
      })
    }
  }
  return (
    <>
      <JiraScopingSelectAllIssues
        usedServiceTaskIds={usedServiceTaskIds}
        issues={edges}
        meetingId={meetingId}
      />
      <ResultScroller>
        {viewer && (
          <NewJiraIssueInput
            isEditing={isEditing}
            meetingRef={meeting}
            setIsEditing={setIsEditing}
            viewerRef={viewer}
          />
        )}
        {edges.map(({node}) => {
          const {id, url, issueKey} = node
          return (
            <ScopingSearchResultItem
              key={id}
              service={'jira'}
              usedServiceTaskIds={usedServiceTaskIds}
              serviceTaskId={id}
              meetingId={meetingId}
              persistQuery={persistQuery}
              summary={node.summary}
              url={url}
              linkText={issueKey}
              linkTitle={`Jira Issue #${issueKey}`}
            />
          )
        })}
      </ResultScroller>
      {!isEditing && (
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      )}
    </>
  )
}

export default createFragmentContainer(JiraScopingSearchResults, {
  meeting: graphql`
    fragment JiraScopingSearchResults_meeting on PokerMeeting {
      ...NewJiraIssueInput_meeting
      id
      teamId
      jiraSearchQuery {
        isJQL
        projectKeyFilters
        queryString
      }
      phases {
        ...useGetUsedServiceTaskIds_phase
        phaseType
      }
    }
  `
})
