import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {MeetingTypeEnum} from '../types/graphql'
import NewMeetingSettingsRetrospective from './NewMeetingSettingsRetrospective'
import {NewMeetingSettings_selectedTeam} from '__generated__/NewMeetingSettings_selectedTeam.graphql'

interface Props {
  meetingType: MeetingTypeEnum
  selectedTeam: NewMeetingSettings_selectedTeam
}

const settingsLookup = {
  // [MeetingTypeEnum.action]: NewMeetingSettingsAction,
  [MeetingTypeEnum.retrospective]: NewMeetingSettingsRetrospective
}

const NewMeetingSettings = (props: Props) => {
  const {meetingType, selectedTeam} = props
  const Settings = settingsLookup[meetingType]
  const {meetingSettings} = selectedTeam
  return <Settings settings={meetingSettings} />
}

export default createFragmentContainer(NewMeetingSettings, {
  selectedTeam: graphql`
    fragment NewMeetingSettings_selectedTeam on Team {
      meetingSettings(meetingType: retrospective) {
        ...NewMeetingSettingsRetrospective_settings
      }
      id
    }
  `
})
