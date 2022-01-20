import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {PALETTE} from '../styles/paletteV3'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import {ScopePhaseAreaAddJira_meeting$key} from '../__generated__/ScopePhaseAreaAddJira_meeting.graphql'
import JiraSVG from './JiraSVG'
import RaisedButton from './RaisedButton'

const AddJiraArea = styled('div')({
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

const AddJiraButton = styled(RaisedButton)({
  whiteSpace: 'pre-wrap'
})
interface Props {
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaAddJira_meeting$key
}

const ScopePhaseAreaAddJira = (props: Props) => {
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const {gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaAddJira_meeting on PokerMeeting {
        teamId
      }
    `,
    meetingRef
  )
  const {teamId} = meeting
  const importStories = () => {
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
  return (
    <AddJiraArea>
      <AddJiraButton onClick={importStories} size={'medium'}>
        <JiraSVG />
        Import stories from Jira
      </AddJiraButton>
      <StyledLink onClick={gotoParabol}>Or add new tasks in Parabol</StyledLink>
    </AddJiraArea>
  )
}

export default ScopePhaseAreaAddJira
