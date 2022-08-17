import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingSettingsRetrospective_team$key} from '~/__generated__/NewMeetingSettingsRetrospective_team.graphql'
import RetroTemplatePicker from '../modules/meeting/components/RetroTemplatePicker'
import NewMeetingSettingsRetrospectiveSettings from './NewMeetingSettingsRetrospectiveSettings'

interface Props {
  teamRef: NewMeetingSettingsRetrospective_team$key
}

const NewMeetingSettingsRetrospective = (props: Props) => {
  const {teamRef} = props
  const team = useFragment(
    graphql`
      fragment NewMeetingSettingsRetrospective_team on Team {
        retroSettings: meetingSettings(meetingType: retrospective) {
          ...RetroTemplatePicker_settings
          ...NewMeetingSettingsToggleCheckIn_settings
          ...NewMeetingSettingsToggleAnonymity_settings
        }
      }
    `,
    teamRef
  )
  const {retroSettings} = team
  return (
    <>
      <RetroTemplatePicker settings={retroSettings} />
      <NewMeetingSettingsRetrospectiveSettings settings={retroSettings} />
    </>
  )
}

export default NewMeetingSettingsRetrospective
