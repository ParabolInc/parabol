import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import RetroTemplatePicker from '../modules/meeting/components/RetroTemplatePicker'
import {NewMeetingSettingsRetrospective_settings} from '__generated__/NewMeetingSettingsRetrospective_settings.graphql'
import styled from '@emotion/styled'
import PlainButton from './PlainButton/PlainButton'
import Checkbox from './Checkbox'
import {ICON_SIZE} from '../styles/typographyV2'
import {PALETTE} from '../styles/paletteV2'

const ButtonRow = styled(PlainButton)({
  alignItems: 'center',
  display: 'flex',
  paddingTop: 12,
  paddingLeft: 12,
  width: 320
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
  settings: NewMeetingSettingsRetrospective_settings
}

const NewMeetingSettingsRetrospective = (props: Props) => {
  const {settings} = props
  return (
    <>
      <RetroTemplatePicker settings={settings} />
      <ButtonRow>
        <StyledCheckbox active />
        <Label>{'Include Social Checkin-In Phase'}</Label>
      </ButtonRow>
    </>
  )
}

export default createFragmentContainer(NewMeetingSettingsRetrospective, {
  settings: graphql`
    fragment NewMeetingSettingsRetrospective_settings on RetrospectiveMeetingSettings {
      ...RetroTemplatePicker_settings
      id
    }
  `
})
