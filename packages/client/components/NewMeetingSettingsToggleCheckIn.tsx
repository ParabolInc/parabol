import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {NewMeetingSettingsToggleCheckIn_settings} from '~/__generated__/NewMeetingSettingsToggleCheckIn_settings.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetMeetingSettingsMutation from '../mutations/SetMeetingSettingsMutation'
import {PALETTE} from '../styles/paletteV3'
import Checkbox from './Checkbox'
import PlainButton from './PlainButton/PlainButton'

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

const Label = styled('div')({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 20,
  fontWeight: 600,
  color: PALETTE.SLATE_900
})

const StyledCheckbox = styled(Checkbox)<{active: boolean}>(({active}) => ({
  color: active ? PALETTE.SKY_500 : PALETTE.SLATE_700,
  fontSize: 28,
  textAlign: 'center',
  userSelect: 'none'
}))

interface Props {
  settings: NewMeetingSettingsToggleCheckIn_settings
}

const NewMeetingSettingsToggleCheckIn = (props: Props) => {
  const {settings} = props
  const {id: settingsId, phaseTypes} = settings
  const hasCheckIn = phaseTypes.includes('checkin')
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()
  const toggleCheckIn = () => {
    if (submitting) return
    submitMutation()
    SetMeetingSettingsMutation(
      atmosphere,
      {checkinEnabled: !hasCheckIn, settingsId},
      {onError, onCompleted}
    )
  }
  return (
    <ButtonRow onClick={toggleCheckIn}>
      <Label>{'Include Icebreaker'}</Label>
      <StyledCheckbox active={hasCheckIn} />
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
