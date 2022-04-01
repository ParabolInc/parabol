import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {PALETTE} from '../styles/paletteV3'
import JiraServerClientManager from '../utils/JiraServerClientManager'
import {ScopePhaseAreaAddJiraServer_meeting$key} from '../__generated__/ScopePhaseAreaAddJiraServer_meeting.graphql'
import JiraServerSVG from './JiraServerSVG'
import RaisedButton from './RaisedButton'

const AddJiraServerArea = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  height: '100%'
})

const StyledLink = styled('span')({
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  outline: 0,
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  },
  paddingTop: 24
})

const AddJiraServerButton = styled(RaisedButton)({
  whiteSpace: 'pre-wrap'
})
interface Props {
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaAddJiraServer_meeting$key
}

const ScopePhaseAreaAddJiraServer = (props: Props) => {
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const {gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaAddJiraServer_meeting on PokerMeeting {
        teamId
        viewerMeetingMember {
          teamMember {
            integrations {
              jiraServer {
                auth {
                  id
                  isActive
                }
                sharedProviders {
                  id
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {teamId, viewerMeetingMember} = meeting

  const provider = viewerMeetingMember?.teamMember.integrations.jiraServer.sharedProviders[0]

  if (!provider) return null

  const openOAuth = () => {
    JiraServerClientManager.openOAuth(atmosphere, provider.id, teamId, mutationProps)
  }

  return (
    <AddJiraServerArea>
      <AddJiraServerButton onClick={openOAuth} size={'medium'}>
        <JiraServerSVG />
        Import issues from Jira Server
      </AddJiraServerButton>
      <StyledLink onClick={gotoParabol}>Or add new tasks in Parabol</StyledLink>
    </AddJiraServerArea>
  )
}

export default ScopePhaseAreaAddJiraServer
