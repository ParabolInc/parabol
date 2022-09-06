import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import AzureDevOpsClientManager from '~/utils/AzureDevOpsClientManager'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {PALETTE} from '../styles/paletteV3'
import {ScopePhaseAreaAddAzureDevOps_meeting$key} from '../__generated__/ScopePhaseAreaAddAzureDevOps_meeting.graphql'
import AzureDevOpsSVG from './AzureDevOpsSVG'
import RaisedButton from './RaisedButton'

const AddAzureDevOpsArea = styled('div')({
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

const AddAzureDevOpsButton = styled(RaisedButton)({
  whiteSpace: 'pre-wrap'
})

interface Props {
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaAddAzureDevOps_meeting$key
}

const ScopePhaseAreaAddAzureDevOps = (props: Props) => {
  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const {gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaAddAzureDevOps_meeting on PokerMeeting {
        teamId
        viewerMeetingMember {
          teamMember {
            integrations {
              azureDevOps {
                cloudProvider {
                  id
                  tenantId
                  clientId
                }
                sharedProviders {
                  id
                  tenantId
                  clientId
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
  const provider =
    viewerMeetingMember?.teamMember.integrations.azureDevOps.sharedProviders[0] ??
    viewerMeetingMember?.teamMember.integrations.azureDevOps.cloudProvider
  if (!provider) {
    return null
  }
  const authAzureDevOps = () => {
    AzureDevOpsClientManager.openOAuth(atmosphere, teamId, provider, mutationProps)
  }
  return (
    <AddAzureDevOpsArea>
      <AddAzureDevOpsButton
        onClick={authAzureDevOps}
        size={t('ScopePhaseAreaAddAzureDevOps.Medium')}
      >
        <AzureDevOpsSVG />
        {t('ScopePhaseAreaAddAzureDevOps.ImportIssuesFromAzureDevops')}
      </AddAzureDevOpsButton>
      <StyledLink onClick={gotoParabol}>
        {t('ScopePhaseAreaAddAzureDevOps.OrAddNewTasksInParabol')}
      </StyledLink>
    </AddAzureDevOpsArea>
  )
}

export default ScopePhaseAreaAddAzureDevOps
