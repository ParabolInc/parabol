import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {NewMeetingSettingsTeamPrompt_team} from '../__generated__/NewMeetingSettingsTeamPrompt_team.graphql'

interface Props {
  team: NewMeetingSettingsTeamPrompt_team
}

const NewMeetingSettingsTeamPrompt = (_props: Props) => {
  return null
}

export default createFragmentContainer(NewMeetingSettingsTeamPrompt, {
  team: graphql`
    fragment NewMeetingSettingsTeamPrompt_team on Team {
      teamPromptSettings: meetingSettings(meetingType: teamPrompt) {
        id
      }
    }
  `
})
