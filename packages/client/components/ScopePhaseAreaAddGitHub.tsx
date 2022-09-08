import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {PALETTE} from '../styles/paletteV3'
import GitHubClientManager from '../utils/GitHubClientManager'
import {ScopePhaseAreaAddGitHub_meeting$key} from '../__generated__/ScopePhaseAreaAddGitHub_meeting.graphql'
import GitHubSVG from './GitHubSVG'
import RaisedButton from './RaisedButton'

const AddGitHubArea = styled('div')({
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

const AddGitHubButton = styled(RaisedButton)({
  whiteSpace: 'pre-wrap'
})
interface Props {
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaAddGitHub_meeting$key
}

const ScopePhaseAreaAddGitHub = (props: Props) => {
  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const {gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaAddGitHub_meeting on PokerMeeting {
        teamId
      }
    `,
    meetingRef
  )
  const {teamId} = meeting

  const authGitHub = () => {
    GitHubClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
  return (
    <AddGitHubArea>
      <AddGitHubButton onClick={authGitHub} size={t('ScopePhaseAreaAddGitHub.Medium')}>
        <GitHubSVG />
        {t('ScopePhaseAreaAddGitHub.ImportIssuesFromGitHub')}
      </AddGitHubButton>
      <StyledLink onClick={gotoParabol}>
        {t('ScopePhaseAreaAddGitHub.OrAddNewTasksInParabol')}
      </StyledLink>
    </AddGitHubArea>
  )
}

export default ScopePhaseAreaAddGitHub
