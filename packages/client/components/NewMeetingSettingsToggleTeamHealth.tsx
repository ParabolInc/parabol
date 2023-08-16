import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingSettingsToggleTeamHealth_settings$key} from '~/__generated__/NewMeetingSettingsToggleTeamHealth_settings.graphql'
import {NewMeetingSettingsToggleTeamHealth_team$key} from '~/__generated__/NewMeetingSettingsToggleTeamHealth_team.graphql'
import isTeamHealthAvailable from '../utils/features/isTeamHealthAvailable'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetMeetingSettingsMutation from '../mutations/SetMeetingSettingsMutation'
import {PALETTE} from '../styles/paletteV3'
import Checkbox from './Checkbox'
import PlainButton from './PlainButton/PlainButton'
import Tooltip from './Tooltip'

const ButtonRow = styled(PlainButton)({
  background: PALETTE.SLATE_200,
  borderRadius: '8px',
  display: 'flex',
  fontSize: 14,
  lineHeight: '24px',
  fontWeight: 600,
  userSelect: 'none',
  width: '100%',
  ':hover': {
    backgroundColor: PALETTE.SLATE_300
  },
  padding: '22px 16px',
  alignItems: 'center'
})

const Label = styled('div')<{disabled: boolean}>(({disabled}) => ({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 20,
  fontWeight: 600,
  color: disabled ? PALETTE.SLATE_600 : PALETTE.SLATE_900
}))

const StyledCheckbox = styled(Checkbox)<{active: boolean}>(({active}) => ({
  '&&': {
    color: active ? PALETTE.SKY_500 : PALETTE.SLATE_700,
    svg: {
      fontSize: 28
    },
    width: 28,
    height: 28,
    textAlign: 'center',
    userSelect: 'none'
  }
}))

interface Props {
  teamRef: NewMeetingSettingsToggleTeamHealth_team$key
  settingsRef: NewMeetingSettingsToggleTeamHealth_settings$key
  className?: string
}

const NewMeetingSettingsToggleTeamHealth = (props: Props) => {
  const {teamRef, settingsRef, className} = props

  const team = useFragment(
    graphql`
      fragment NewMeetingSettingsToggleTeamHealth_team on Team {
        id
        tier
      }
    `,
    teamRef
  )

  // not part of the team fragment as we don't want to specify the meeting type here
  const settings = useFragment(
    graphql`
      fragment NewMeetingSettingsToggleTeamHealth_settings on TeamMeetingSettings {
        id
        phaseTypes
      }
    `,
    settingsRef
  )
  const {tier} = team
  const teamHealthAvailable = isTeamHealthAvailable(tier)

  const {id: settingsId, phaseTypes} = settings
  const hasTeamHealth = phaseTypes.includes('TEAM_HEALTH')
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()
  const toggleTeamHealth = () => {
    if (submitting) return
    submitMutation()
    SetMeetingSettingsMutation(
      atmosphere,
      {teamHealthEnabled: !hasTeamHealth, settingsId},
      {onError, onCompleted}
    )
  }
  return (
    <Tooltip
      text={
        teamHealthAvailable
          ? undefined
          : 'Team Health is only available on Team and Enterprise plans'
      }
    >
      <ButtonRow onClick={toggleTeamHealth} className={className} disabled={!teamHealthAvailable}>
        <Label disabled={!teamHealthAvailable}>{'Include Team Health check'}</Label>
        <StyledCheckbox active={hasTeamHealth} disabled={!teamHealthAvailable} />
      </ButtonRow>
    </Tooltip>
  )
}

export default NewMeetingSettingsToggleTeamHealth
