import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingSettingsToggleAnonymity_settings$key} from '~/__generated__/NewMeetingSettingsToggleAnonymity_settings.graphql'
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
  svg: {
    fontSize: 28
  },
  width: 28,
  height: 28,
  textAlign: 'center',
  userSelect: 'none'
}))

interface Props {
  settingsRef: NewMeetingSettingsToggleAnonymity_settings$key
  className?: string
}

const NewMeetingSettingsToggleAnonymity = (props: Props) => {
  const {settingsRef, className} = props

  const settings = useFragment(
    graphql`
      fragment NewMeetingSettingsToggleAnonymity_settings on TeamMeetingSettings {
        id
        ... on RetrospectiveMeetingSettings {
          disableAnonymity
        }
      }
    `,
    settingsRef
  )

  const {id: settingsId, disableAnonymity} = settings
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()
  const toggleCheckIn = () => {
    if (submitting) return
    submitMutation()
    SetMeetingSettingsMutation(
      atmosphere,
      {disableAnonymity: !disableAnonymity, settingsId},
      {onError, onCompleted}
    )
  }
  return (
    <ButtonRow onClick={toggleCheckIn} className={className}>
      <Label>{'Anonymous reflections'}</Label>
      <StyledCheckbox active={!disableAnonymity} />
    </ButtonRow>
  )
}

export default NewMeetingSettingsToggleAnonymity
