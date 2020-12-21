import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import {NewMeetingSettingsPoker_team} from '~/__generated__/NewMeetingSettingsPoker_team.graphql'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'
import PokerTemplatePicker from '../modules/meeting/components/PokerTemplatePicker'
import useAtmosphere from '../hooks/useAtmosphere'
import {MeetingTypeEnum} from '../types/graphql'
import setTemplateId from '../utils/relay/setTemplateId'

interface Props {
  team: NewMeetingSettingsPoker_team
}

const NewMeetingSettingsPoker = (props: Props) => {
  const {team} = props
  const {pokerSettings} = team
  const {selectedTemplateId, teamId} = pokerSettings

  const atmosphere = useAtmosphere()
  useEffect(() => {
    setTemplateId(atmosphere, teamId, selectedTemplateId!, MeetingTypeEnum.poker)
  }, [])

  return (
    <>
      <PokerTemplatePicker settings={pokerSettings} />
      <NewMeetingSettingsToggleCheckIn settings={pokerSettings} />
    </>
  )
}

export default createFragmentContainer(NewMeetingSettingsPoker, {
  team: graphql`
    fragment NewMeetingSettingsPoker_team on Team {
      pokerSettings: meetingSettings(meetingType: poker) {
        teamId
        ...on PokerMeetingSettings {
          selectedTemplateId
        }
        ...PokerTemplatePicker_settings
        ...NewMeetingSettingsToggleCheckIn_settings
      }
    }
  `
})
