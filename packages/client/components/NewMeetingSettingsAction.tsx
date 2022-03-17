import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'
import {NewMeetingSettingsAction_team$key} from '../__generated__/NewMeetingSettingsAction_team.graphql'

interface Props {
  teamRef: NewMeetingSettingsAction_team$key
}

const NewMeetingSettingsAction = (props: Props) => {
  const {teamRef} = props
  const team = useFragment(
    graphql`
      fragment NewMeetingSettingsAction_team on Team {
        actionSettings: meetingSettings(meetingType: action) {
          ...NewMeetingSettingsToggleCheckIn_settings
        }
      }
    `,
    teamRef
  )
  const {actionSettings} = team
  return <NewMeetingSettingsToggleCheckIn settings={actionSettings} />
}

export default NewMeetingSettingsAction
