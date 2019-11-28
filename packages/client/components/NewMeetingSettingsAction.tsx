import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {NewMeetingSettingsAction_settings} from '__generated__/NewMeetingSettingsAction_settings.graphql'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'

interface Props {
  settings: NewMeetingSettingsAction_settings
}

const NewMeetingSettingsAction = (props: Props) => {
  const {settings} = props
  return <NewMeetingSettingsToggleCheckIn settings={settings} />
}

export default createFragmentContainer(NewMeetingSettingsAction, {
  settings: graphql`
    fragment NewMeetingSettingsAction_settings on ActionMeetingSettings {
      ...NewMeetingSettingsToggleCheckIn_settings
    }
  `
})
