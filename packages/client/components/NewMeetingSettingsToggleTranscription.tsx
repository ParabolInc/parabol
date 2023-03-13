import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
// import {NewMeetingSettingsToggleTranscription_settings$key} from '~/__generated__/NewMeetingSettingsToggleTranscription_settings.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetMeetingSettingsMutation from '../mutations/SetMeetingSettingsMutation'
import {PALETTE} from '../styles/paletteV3'
import Checkbox from './Checkbox'
import PlainButton from './PlainButton/PlainButton'

const ButtonRow = styled(PlainButton)<{isInput?: boolean}>(({isInput}) => ({
  background: isInput ? 'transparent' : PALETTE.SLATE_200,
  borderRadius: '8px',
  display: 'flex',
  fontSize: 14,
  lineHeight: '24px',
  fontWeight: 600,
  userSelect: 'none',
  width: '100%',
  ':hover': {
    backgroundColor: isInput ? 'transparent' : PALETTE.SLATE_300
  },
  padding: '22px 16px',
  alignItems: 'center'
}))

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

const StyledInput = styled('input')({
  appearance: 'none',
  background: 'inherit',
  border: 'none',
  color: PALETTE.SLATE_700,
  fontSize: 16,
  margin: 0,
  padding: '0px 8px 0px 0px',
  outline: 0,
  width: '100%',
  ':focus': {
    outline: 'none'
  }
})

interface Props {
  settingsRef: any // NewMeetingSettingsToggleTranscription_settings$key
  className?: string
}

const NewMeetingSettingsToggleTranscription = (props: Props) => {
  const {settingsRef, className} = props
  const settings = useFragment(
    graphql`
      fragment NewMeetingSettingsToggleTranscription_settings on TeamMeetingSettings {
        id
        phaseTypes
      }
    `,
    settingsRef
  )
  const {id: settingsId, phaseTypes} = settings
  const [isChecked, setIsChecked] = useState(false)
  const hasCheckIn = phaseTypes.includes('checkin')
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()
  const toggleCheckIn = () => {
    setIsChecked((isChecked) => !isChecked)
    // if (submitting) return
    // submitMutation()
    // SetMeetingSettingsMutation(
    //   atmosphere,
    //   {checkinEnabled: !hasCheckIn, settingsId},
    //   {onError, onCompleted}
    // )
  }
  return (
    <>
      {!isChecked && (
        <ButtonRow onClick={toggleCheckIn} className={className}>
          <Label>{'Include Zoom Transcription'}</Label>
          <StyledCheckbox active={isChecked} />
        </ButtonRow>
      )}
      {isChecked && (
        <ButtonRow>
          <StyledInput placeholder='Enter your meeting id' />
          <StyledCheckbox active={isChecked} />
        </ButtonRow>
      )}
    </>
  )
}

export default NewMeetingSettingsToggleTranscription
