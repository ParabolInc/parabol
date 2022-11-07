import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MeetingTypeEnum} from '~/__generated__/NewMeetingQuery.graphql'
import {NewMeetingSettings_selectedTeam$key} from '~/__generated__/NewMeetingSettings_selectedTeam.graphql'
import {NewMeetingSettings_viewer$key} from '~/__generated__/NewMeetingSettings_viewer.graphql'
import NewMeetingSettingsAction from './NewMeetingSettingsAction'
import NewMeetingSettingsPoker from './NewMeetingSettingsPoker'
import NewMeetingSettingsRetrospective from './NewMeetingSettingsRetrospective'
import NewMeetingSettingsTeamPrompt from './NewMeetingSettingsTeamPrompt'

interface Props {
  meetingType: MeetingTypeEnum
  selectedTeamRef: NewMeetingSettings_selectedTeam$key
  viewerRef: NewMeetingSettings_viewer$key
}

const settingsLookup = {
  action: NewMeetingSettingsAction,
  retrospective: NewMeetingSettingsRetrospective,
  poker: NewMeetingSettingsPoker,
  teamPrompt: NewMeetingSettingsTeamPrompt
}

const NewMeetingSettings = (props: Props) => {
  const {meetingType, selectedTeamRef, viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment NewMeetingSettings_viewer on User {
        ...NewMeetingSettingsRetrospective_viewer
      }
    `,
    viewerRef
  )
  const selectedTeam = useFragment(
    graphql`
      fragment NewMeetingSettings_selectedTeam on Team {
        ...NewMeetingSettingsRetrospective_team
        ...NewMeetingSettingsAction_team
        ...NewMeetingSettingsPoker_team
        ...NewMeetingSettingsTeamPrompt_team
        id
      }
    `,
    selectedTeamRef
  )

  const Settings = settingsLookup[meetingType]
  return <Settings teamRef={selectedTeam} viewerRef={viewer} />
}

export default NewMeetingSettings
