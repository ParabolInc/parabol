import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import {JiraScopingSearchResults_meeting} from '../__generated__/JiraScopingSearchResults_meeting.graphql'
import {JiraScopingSearchResults_viewer} from '../__generated__/JiraScopingSearchResults_viewer.graphql'
import JiraScopingNoResults from './JiraScopingNoResults'
import JiraScopingSearchResultItem from './JiraScopingSearchResultItem'
import JiraScopingSelectAllIssues from './JiraScopingSelectAllIssues'

interface Props {
  viewer: JiraScopingSearchResults_viewer
  meeting: JiraScopingSearchResults_meeting
}

const JiraScopingSearchResults = (props: Props) => {
  const {viewer, meeting} = props
  const {team} = viewer
  const {jiraIssues} = team!
  const {error, edges} = jiraIssues
  const issueCount = edges.length
  const {id: meetingId, phases} = meeting
  const estimatePhase = phases.find((phase) => phase.phaseType === NewMeetingPhaseTypeEnum.ESTIMATE)!
  const {stages} = estimatePhase
  const jiraIssueIds = new Set<string>()
  stages!.forEach((stage) => {
    if (!stage.issue) return
    jiraIssueIds.add(stage.issue.id)
  })
  /*   const [showMock, setShowMock] = useState(false)
    useHotkey('f', () => {
      setShowMock(!showMock)
    })
    if (showMock) {
      return (
        <MockScopingList />
      )
    } */

  if (issueCount === 0) {
    return <JiraScopingNoResults error={error?.message} />
  }

  return (
    <>
      <JiraScopingSelectAllIssues selected={false} issueCount={issueCount} />
      {edges.map(({node}) => {
        return <JiraScopingSearchResultItem key={node.id} issue={node} isSelected={jiraIssueIds.has(node.id)} meetingId={meetingId} />
      })}
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
      team(teamId: $teamId) {
        jiraIssues(first: $first, queryString: $queryString, isJQL: $isJQL, projectKeyFilters: $projectKeyFilters) @connection(key: "JiraScopingSearchResults_jiraIssues") {
          error {
            message
          }
          edges {
            node {
              ...JiraScopingSearchResultItem_issue
              id
            }
          }
        }
      }
      id
    }
  `
})
