import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingSettingsPoker_team$key} from '~/__generated__/NewMeetingSettingsPoker_team.graphql'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'
import PokerTemplatePicker from '../modules/meeting/components/PokerTemplatePicker'

interface Props {
  teamRef: NewMeetingSettingsPoker_team$key
}

const NewMeetingSettingsPoker = (props: Props) => {
  const {teamRef} = props
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
  const {pokerSettings} = team
  return (
    <>
      <PokerTemplatePicker settings={pokerSettings} />
      <NewMeetingSettingsToggleCheckIn settings={pokerSettings} />
    </>
  )
}

export default NewMeetingSettingsPoker
