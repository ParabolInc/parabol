import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import RetroTemplatePicker from '../modules/meeting/components/RetroTemplatePicker'
import {NewMeetingSettingsRetrospective_settings} from '__generated__/NewMeetingSettingsRetrospective_settings.graphql'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'

interface Props {
  settings: NewMeetingSettingsRetrospective_settings
}

const NewMeetingSettingsRetrospective = (props: Props) => {
  const {settings} = props
  return (
    <>
      <RetroTemplatePicker settings={settings} />
      <NewMeetingSettingsToggleCheckIn settings={settings} />
    </>
  )
}

export default createFragmentContainer(NewMeetingSettingsRetrospective, {
  settings: graphql`
    fragment NewMeetingSettingsRetrospective_settings on RetrospectiveMeetingSettings {
      ...RetroTemplatePicker_settings
      ...NewMeetingSettingsToggleCheckIn_settings
    }
  `
})
