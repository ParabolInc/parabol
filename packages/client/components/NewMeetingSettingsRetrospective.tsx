import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import {NewMeetingSettingsRetrospective_team} from '~/__generated__/NewMeetingSettingsRetrospective_team.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import RetroTemplatePicker from '../modules/meeting/components/RetroTemplatePicker'
import {MeetingTypeEnum} from '../types/graphql'
import setActiveTemplate from '../utils/relay/setActiveTemplate'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'

interface Props {
  team: NewMeetingSettingsRetrospective_team
}

const NewMeetingSettingsRetrospective = (props: Props) => {
  const {team} = props
  const {retroSettings} = team
  const {selectedTemplateId, teamId} = retroSettings

  const atmosphere = useAtmosphere()
  useEffect(() => {
    setActiveTemplate(atmosphere, teamId, selectedTemplateId!, MeetingTypeEnum.retrospective)
  }, [])

  return (
    <>
      <RetroTemplatePicker settings={retroSettings} />
      <NewMeetingSettingsToggleCheckIn settings={retroSettings} />
    </>
  )
}

export default createFragmentContainer(NewMeetingSettingsRetrospective, {
  team: graphql`
    fragment NewMeetingSettingsRetrospective_team on Team {
      retroSettings: meetingSettings(meetingType: retrospective) {
        teamId
        ...on RetrospectiveMeetingSettings {
          selectedTemplateId
        }
        ...RetroTemplatePicker_settings
        ...NewMeetingSettingsToggleCheckIn_settings
      }
    }
  `
})
