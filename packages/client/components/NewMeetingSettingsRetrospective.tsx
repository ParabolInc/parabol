import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingSettingsRetrospective_team$key} from '~/__generated__/NewMeetingSettingsRetrospective_team.graphql'
import {NewMeetingSettingsRetrospective_viewer$key} from '~/__generated__/NewMeetingSettingsRetrospective_viewer.graphql'
import RetroTemplatePicker from '../modules/meeting/components/RetroTemplatePicker'
import NewMeetingSettingsRetrospectiveSettings from './NewMeetingSettingsRetrospectiveSettings'

interface Props {
  teamRef: NewMeetingSettingsRetrospective_team$key
  viewerRef: NewMeetingSettingsRetrospective_viewer$key
}

const NewMeetingSettingsRetrospective = (props: Props) => {
  const {teamRef, viewerRef} = props
  const team = useFragment(
    graphql`
      fragment NewMeetingSettingsRetrospective_team on Team {
        retroSettings: meetingSettings(meetingType: retrospective) {
          ...RetroTemplatePicker_settings
          ...NewMeetingSettingsRetrospectiveSettings_settings
        }
      }
    `,
    teamRef
  )
  const viewer = useFragment(
    graphql`
      fragment NewMeetingSettingsRetrospective_viewer on User {
        ...RetroTemplatePicker_viewer
      }
    `,
    viewerRef
  )
  const {retroSettings} = team
  return (
    <>
      <RetroTemplatePicker settingsRef={retroSettings} viewerRef={viewer} />
      <NewMeetingSettingsRetrospectiveSettings settingsRef={retroSettings} />
    </>
  )
}

export default NewMeetingSettingsRetrospective
