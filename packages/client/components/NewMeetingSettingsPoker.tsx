import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingSettingsPoker_team$key} from '~/__generated__/NewMeetingSettingsPoker_team.graphql'
import {NewMeetingSettingsPoker_viewer$key} from '~/__generated__/NewMeetingSettingsPoker_viewer.graphql'
import PokerTemplatePicker from '../modules/meeting/components/PokerTemplatePicker'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'

interface Props {
  teamRef: NewMeetingSettingsPoker_team$key
  viewerRef: NewMeetingSettingsPoker_viewer$key
}

const NewMeetingSettingsPoker = (props: Props) => {
  const {teamRef, viewerRef} = props
  const team = useFragment(
    graphql`
      fragment NewMeetingSettingsPoker_team on Team {
        pokerSettings: meetingSettings(meetingType: poker) {
          ...PokerTemplatePicker_settings
          ...NewMeetingSettingsToggleCheckIn_settings
        }
      }
    `,
    teamRef
  )
  const viewer = useFragment(
    graphql`
      fragment NewMeetingSettingsPoker_viewer on User {
        ...PokerTemplatePicker_viewer
      }
    `,
    viewerRef
  )
  const {pokerSettings} = team
  return (
    <>
      <PokerTemplatePicker settingsRef={pokerSettings} viewerRef={viewer} />
      <NewMeetingSettingsToggleCheckIn settingsRef={pokerSettings} />
    </>
  )
}

export default NewMeetingSettingsPoker
