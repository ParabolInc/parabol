import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useMemo, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import MockScopingList from '../modules/meeting/components/MockScopingList'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import {JiraScopingSearchResults_meeting} from '../__generated__/JiraScopingSearchResults_meeting.graphql'
import {JiraScopingSearchResults_viewer} from '../__generated__/JiraScopingSearchResults_viewer.graphql'
import JiraScopingNoResults from './JiraScopingNoResults'
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
  const issues = viewer?.teamMember!.integrations.atlassian?.issues! ?? null
  const incomingEdges = issues?.edges ?? null
  const error = issues?.error ?? null
  const [edges, setEdges] = useState([] as readonly any[])
  useEffect(() => {
    if (incomingEdges) {
      setEdges(incomingEdges)
    }
  }, [incomingEdges])
  const {id: meetingId, phases} = meeting
  const estimatePhase = phases.find((phase) => phase.phaseType === NewMeetingPhaseTypeEnum.ESTIMATE)!
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
    return viewer ? <JiraScopingNoResults error={error?.message} /> : <MockScopingList />
  }

  return (
    <>
      <JiraScopingSelectAllIssues usedJiraIssueIds={usedJiraIssueIds} issues={edges} meetingId={meetingId} />
      <ResultScroller>
        {edges.map(({node}) => {
          return <JiraScopingSearchResultItem key={node.id} issue={node} isSelected={usedJiraIssueIds.has(node.id)} meetingId={meetingId} />
        })}
      </ResultScroller>
    </>

  )
}

export default createFragmentContainer(JiraScopingSearchResults, {
  meeting: graphql`
    fragment JiraScopingSearchResults_meeting on PokerMeeting {
      id
      phases {
        phaseType
        ...on EstimatePhase {
          stages {
            ...on EstimateStageJira {
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
            issues(first: $first, queryString: $queryString, isJQL: $isJQL, projectKeyFilters: $projectKeyFilters) @connection(key: "JiraScopingSearchResults_issues") {
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
