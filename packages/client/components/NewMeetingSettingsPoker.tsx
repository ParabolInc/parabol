import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {NewMeetingSettingsPoker_team} from '~/__generated__/NewMeetingSettingsPoker_team.graphql'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'

interface Props {
  team: NewMeetingSettingsPoker_team
}

const NewMeetingSettingsPoker = (props: Props) => {
  const {team} = props
  const {pokerSettings} = team
  return (
    <>
      {/* <RetroTemplatePicker settings={pokerSettings} /> */}
      <NewMeetingSettingsToggleCheckIn settings={pokerSettings} />
    </>
  )
}

export default createFragmentContainer(NewMeetingSettingsPoker, {
  team: graphql`
    fragment NewMeetingSettingsPoker_team on Team {
      pokerSettings: meetingSettings(meetingType: poker) {
        ...NewMeetingSettingsToggleCheckIn_settings
      }
    }
  `
})
