import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
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
  const {t} = useTranslation()

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
  const authJira = () => {
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
  return (
    <AddJiraArea>
      <AddJiraButton onClick={authJira} size={t('ScopePhaseAreaAddJira.Medium')}>
        <JiraSVG />
        {t('ScopePhaseAreaAddJira.ImportIssuesFromJira')}
      </AddJiraButton>
      <StyledLink onClick={gotoParabol}>
        {t('ScopePhaseAreaAddJira.OrAddNewTasksInParabol')}
      </StyledLink>
    </AddJiraArea>
  )
}

export default ScopePhaseAreaAddJira
