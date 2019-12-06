import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'
import {NewMeetingSettingsAction_team} from '../__generated__/NewMeetingSettingsAction_team.graphql'

interface Props {
  team: NewMeetingSettingsAction_team
}

const NewMeetingSettingsAction = (props: Props) => {
  const {team} = props
  const {actionSettings} = team
  return <NewMeetingSettingsToggleCheckIn settings={actionSettings} />
}

export default createFragmentContainer(NewMeetingSettingsAction, {
  team: graphql`
    fragment NewMeetingSettingsAction_team on Team {
      actionSettings: meetingSettings(meetingType: action) {
        ...NewMeetingSettingsToggleCheckIn_settings
      }
    }
  `
})
