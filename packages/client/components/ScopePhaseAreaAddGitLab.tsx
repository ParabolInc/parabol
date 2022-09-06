import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import GitLabClientManager from '~/utils/GitLabClientManager'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {PALETTE} from '../styles/paletteV3'
import {ScopePhaseAreaAddGitLab_meeting$key} from '../__generated__/ScopePhaseAreaAddGitLab_meeting.graphql'
import GitLabSVG from './GitLabSVG'
import RaisedButton from './RaisedButton'

const AddGitLabArea = styled('div')({
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

const AddGitLabButton = styled(RaisedButton)({
  whiteSpace: 'pre-wrap'
})

interface Props {
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaAddGitLab_meeting$key
}

const ScopePhaseAreaAddGitLab = (props: Props) => {
  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const {gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaAddGitLab_meeting on PokerMeeting {
        teamId
        viewerMeetingMember {
          teamMember {
            integrations {
              gitlab {
                cloudProvider {
                  id
                  clientId
                  serverBaseUrl
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
  if (!viewerMeetingMember) return null
  const {teamMember} = viewerMeetingMember
  const {integrations} = teamMember
  const {gitlab} = integrations
  const {cloudProvider} = gitlab
  if (!cloudProvider) return null
  const {id: providerId, clientId, serverBaseUrl} = cloudProvider

  const authGitLab = () => {
    GitLabClientManager.openOAuth(
      atmosphere,
      providerId,
      clientId,
      serverBaseUrl,
      teamId,
      mutationProps
    )
  }
  return (
    <AddGitLabArea>
      <AddGitLabButton onClick={authGitLab} size={t('ScopePhaseAreaAddGitLab.Medium')}>
        <GitLabSVG />
        {t('ScopePhaseAreaAddGitLab.ImportIssuesFromGitlab')}
      </AddGitLabButton>
      <StyledLink onClick={gotoParabol}>
        {t('ScopePhaseAreaAddGitLab.OrAddNewTasksInParabol')}
      </StyledLink>
    </AddGitLabArea>
  )
}

export default ScopePhaseAreaAddGitLab
