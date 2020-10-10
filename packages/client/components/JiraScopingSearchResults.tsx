import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useMemo, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import MockScopingList from '../modules/meeting/components/MockScopingList'
import PersistJiraSearchQueryMutation from '../mutations/PersistJiraSearchQueryMutation'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import {JiraScopingSearchResults_meeting} from '../__generated__/JiraScopingSearchResults_meeting.graphql'
import {JiraScopingSearchResults_viewer} from '../__generated__/JiraScopingSearchResults_viewer.graphql'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import JiraScopingSearchResultItem from './JiraScopingSearchResultItem'
import JiraScopingSelectAllIssues from './JiraScopingSelectAllIssues'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

interface Props {
  viewer: JiraScopingSearchResults_viewer | null
  meeting: JiraScopingSearchResults_meeting
}

const JiraScopingSearchResults = (props: Props) => {
  const {viewer, meeting} = props
  const atlassian = viewer?.teamMember!.integrations.atlassian ?? null
  const issues = atlassian?.issues! ?? null
  const incomingEdges = issues?.edges ?? null
  const error = issues?.error ?? null
  const [edges, setEdges] = useState([] as readonly any[])
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (incomingEdges) {
      setEdges(incomingEdges)
    }
  }, [incomingEdges])
  const {id: meetingId, teamId, phases, jiraSearchQuery} = meeting
  const estimatePhase = phases.find(
    (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.ESTIMATE
  )!
  const {stages} = estimatePhase
  const usedJiraIssueIds = useMemo(() => {
    const usedJiraIssueIds = new Set<string>()
    stages!.forEach((stage) => {
      if (!stage.issue) return
      usedJiraIssueIds.add(stage.issue.id)
    })
    return usedJiraIssueIds
  }, [stages])

  // Terry, you can use this in case you need to put some final touches on styles
  /*   const [showMock, setShowMock] = useState(false)
    useHotkey('f', () => {
      setShowMock(!showMock)
    })
    if (showMock) {
      return (
        <MockScopingList />
      )
    } */
  if (edges.length === 0) {
    // only show the mock on the initial load or if the last query returned no results
    return viewer ? (
      <IntegrationScopingNoResults error={error?.message} msg={'No issues match that query'} />
    ) : (
      <MockScopingList />
    )
  }

  const persistQuery = () => {
    const {queryString, isJQL} = jiraSearchQuery
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
        usedJiraIssueIds={usedJiraIssueIds}
        issues={edges}
        meetingId={meetingId}
      />
      <ResultScroller>
        {edges.map(({node}) => {
          return (
            <JiraScopingSearchResultItem
              key={node.id}
              issue={node}
              isSelected={usedJiraIssueIds.has(node.id)}
              meetingId={meetingId}
              persistQuery={persistQuery}
            />
          )
        })}
      </ResultScroller>
    </>
  )
}

export default createFragmentContainer(JiraScopingSearchResults, {
  meeting: graphql`
    fragment JiraScopingSearchResults_meeting on PokerMeeting {
      id
      teamId
      jiraSearchQuery {
        isJQL
        projectKeyFilters
        queryString
      }
      phases {
        phaseType
        ... on EstimatePhase {
          stages {
            ... on EstimateStageJira {
              issue {
                id
              }
            }
          }
        }
      }
    }
  `,
  viewer: graphql`
    fragment JiraScopingSearchResults_viewer on User {
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
                  ...JiraScopingSearchResultItem_issue
                  id
                }
              }
            }
          }
        }
      }
    }
  `
})
