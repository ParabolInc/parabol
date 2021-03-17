import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ScopePhaseAreaGitHub_meeting} from '../__generated__/ScopePhaseAreaGitHub_meeting.graphql'
// import ScopePhaseAreaAddGitHub from './ScopePhaseAreaAddGitHub'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'
// import ScopePhaseAreaGitHubScoping from './ScopePhaseAreaGitHubScoping'
// import NewJiraIssueInput from './NewJiraIssueInput'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

interface Props {
  isActive: boolean
  gotoParabol: () => void
  meeting: ScopePhaseAreaGitHub_meeting
}

const ScopePhaseAreaGitHub = (props: Props) => {
  // const {isActive, gotoParabol, meeting} = props
  const {isActive, meeting} = props
  const {viewerMeetingMember} = meeting
  const [isEditing, setIsEditing] = useState(false)
  if (!viewerMeetingMember || !isActive) return null
  // const {teamMember} = viewerMeetingMember
  // const {integrations} = teamMember
  // const hasAuth = integrations?.github?.isActive ?? false

  const handleAddIssueClick = () => setIsEditing(true)

  // if (!hasAuth) return <ScopePhaseAreaAddGitHub gotoParabol={gotoParabol} meeting={meeting} />
  return (
    <>
      <div>'Coming Soon!'</div>
      <ResultScroller>
        {/* <NewJiraIssueInput isEditing={isEditing} meeting={meeting} setIsEditing={setIsEditing} /> */}
      </ResultScroller>
      {!isEditing && (
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      )}
    </>
  )
  // return <ScopePhaseAreaGitHubScoping meeting={meeting} />
}

export default createFragmentContainer(ScopePhaseAreaGitHub, {
  meeting: graphql`
    fragment ScopePhaseAreaGitHub_meeting on PokerMeeting {
      ...ScopePhaseAreaAddGitHub_meeting
      ...ScopePhaseAreaGitHubScoping_meeting
      viewerMeetingMember {
        teamMember {
          integrations {
            github {
              isActive
            }
          }
        }
      }
    }
  `
})
