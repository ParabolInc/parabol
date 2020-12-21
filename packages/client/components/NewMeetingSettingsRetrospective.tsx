import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {NewMeetingSettingsRetrospective_team} from '~/__generated__/NewMeetingSettingsRetrospective_team.graphql'
import RetroTemplatePicker from '../modules/meeting/components/RetroTemplatePicker'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'

interface Props {
  team: NewMeetingSettingsRetrospective_team
}

const NewMeetingSettingsRetrospective = (props: Props) => {
  const {team} = props
  const {retroSettings} = team
  return (
    <>
      <RetroTemplatePicker settings={retroSettings} />
      <NewMeetingSettingsToggleCheckIn settings={retroSettings} />
    </>
  )
}

export default createFragmentContainer(NewMeetingSettingsRetrospective, {
  team: graphql`
    fragment NewMeetingSettingsRetrospective_team on Team {
      retroSettings: meetingSettings(meetingType: retrospective) {
        ...RetroTemplatePicker_settings
        ...NewMeetingSettingsToggleCheckIn_settings
      }
    }
  `
})
