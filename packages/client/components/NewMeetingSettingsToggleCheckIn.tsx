import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import PlainButton from './PlainButton/PlainButton'
import Checkbox from './Checkbox'
import {ICON_SIZE} from '../styles/typographyV2'
import {PALETTE} from '../styles/paletteV2'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import SetCheckInEnabledMutation from '../mutations/SetCheckInEnabledMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {NewMeeting} from '../types/constEnums'
import {NewMeetingSettingsToggleCheckIn_settings} from '__generated__/NewMeetingSettingsToggleCheckIn_settings.graphql'

const ButtonRow = styled(PlainButton)({
  alignItems: 'center',
  display: 'flex',
  paddingTop: 12,
  paddingLeft: 12,
  width: NewMeeting.CONTROLS_WIDTH
})

const Label = styled('div')({
  color: PALETTE.TEXT_GRAY,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
  minWidth: 160,
  padding: '8px 0 8px 8px',
  userSelect: 'none'
})

const StyledCheckbox = styled(Checkbox)({
  fontSize: ICON_SIZE.MD24,
  marginRight: 8,
  textAlign: 'center',
  userSelect: 'none',
  width: ICON_SIZE.MD24
})

interface Props {
  settings: NewMeetingSettingsToggleCheckIn_settings
}

const NewMeetingSettingsToggleCheckIn = (props: Props) => {
  const {settings} = props
  const {id: settingsId, phaseTypes} = settings
  const hasCheckIn = phaseTypes.includes(NewMeetingPhaseTypeEnum.checkin)
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()
  const toggleCheckIn = () => {
    if (submitting) return
    submitMutation()
    SetCheckInEnabledMutation(
      atmosphere,
      {isEnabled: !hasCheckIn, settingsId},
      {onError, onCompleted}
    )
  }
  return (
    <ButtonRow onClick={toggleCheckIn}>
      <StyledCheckbox active={hasCheckIn} />
      <Label>{'Include Social Check-In Phase'}</Label>
    </ButtonRow>
  )
}

export default createFragmentContainer(NewMeetingSettingsToggleCheckIn, {
  settings: graphql`
    fragment NewMeetingSettingsToggleCheckIn_settings on TeamMeetingSettings {
      id
      phaseTypes
    }
  `
})
