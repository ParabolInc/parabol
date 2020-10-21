import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useMemo, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import PersistJiraSearchQueryMutation from '../mutations/PersistJiraSearchQueryMutation'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import {JiraScopingSearchResults_meeting} from '../__generated__/JiraScopingSearchResults_meeting.graphql'
import {JiraScopingSearchResults_viewer} from '../__generated__/JiraScopingSearchResults_viewer.graphql'
import JiraScopingNoResults from './JiraScopingNoResults'
import JiraScopingSearchResultItem from './JiraScopingSearchResultItem'
import JiraScopingSelectAllIssues from './JiraScopingSelectAllIssues'
import FloatingActionButton from './FloatingActionButton'
import {ZIndex} from '~/types/constEnums'
import Icon from './Icon'
import NewJiraIssueInput from './NewJiraIssueInput'

const Button = styled(FloatingActionButton)({
  color: '#fff',
  padding: '10px 12px',
  width: '150px',
  top: '85%',
  left: '74%',
  position: 'absolute',
  zIndex: ZIndex.FAB
})

const StyledIcon = styled(Icon)({
  paddingRight: 8
})

const StyledLabel = styled('div')({
  fontSize: 16,
  fontWeight: 600
})

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
  const [isEditing, setIsEditing] = useState(false)
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
      {edges.length === 0 && !isEditing ? (
        <JiraScopingNoResults error={error?.message} />
      ) : (
        <>
          <JiraScopingSelectAllIssues
            usedJiraIssueIds={usedJiraIssueIds}
            issues={edges}
            meetingId={meetingId}
          />
          <ResultScroller>
            <NewJiraIssueInput
              isEditing={isEditing}
              meeting={meeting}
              setIsEditing={setIsEditing}
              viewer={viewer}
            />
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
      )}
      <Button onClick={() => setIsEditing(true)} palette='blue'>
        <StyledIcon>{'add'}</StyledIcon>
        <StyledLabel>{'New Issue'}</StyledLabel>
      </Button>
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
                  ...JiraScopingSearchResultItem_issue
                  id
                  summary
                }
              }
            }
          }
        }
      }
    }
  `
})
