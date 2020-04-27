import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {NewMeetingSettings_selectedTeam} from '~/__generated__/NewMeetingSettings_selectedTeam.graphql'
import {MeetingTypeEnum} from '../types/graphql'
import NewMeetingSettingsAction from './NewMeetingSettingsAction'
import NewMeetingSettingsRetrospective from './NewMeetingSettingsRetrospective'

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
