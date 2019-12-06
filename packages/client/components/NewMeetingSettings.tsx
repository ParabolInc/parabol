import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {MeetingTypeEnum} from '../types/graphql'
import NewMeetingSettingsRetrospective from './NewMeetingSettingsRetrospective'
import {NewMeetingSettings_selectedTeam} from '__generated__/NewMeetingSettings_selectedTeam.graphql'
import NewMeetingSettingsAction from './NewMeetingSettingsAction'

interface Props {
  meetingType: MeetingTypeEnum
  selectedTeam: NewMeetingSettings_selectedTeam
}

const settingsLookup = {
  [MeetingTypeEnum.action]: NewMeetingSettingsAction,
  [MeetingTypeEnum.retrospective]: NewMeetingSettingsRetrospective
}

const NewMeetingSettings = (props: Props) => {
  const {meetingType, selectedTeam} = props
  const Settings = settingsLookup[meetingType]
  return <Settings team={selectedTeam} />
}

export default createFragmentContainer(NewMeetingSettings, {
  selectedTeam: graphql`
    fragment NewMeetingSettings_selectedTeam on Team {
      ...NewMeetingSettingsRetrospective_team
      ...NewMeetingSettingsAction_team
      id
    }
  `
})
