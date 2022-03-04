import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {NewMeetingSettingsTeamPrompt_team$key} from '../__generated__/NewMeetingSettingsTeamPrompt_team.graphql'

interface Props {
  teamRef: NewMeetingSettingsTeamPrompt_team$key
}

const NewMeetingSettingsTeamPrompt = (props: Props) => {
  const {teamRef} = props
  useFragment(
    graphql`
      fragment NewMeetingSettingsTeamPrompt_team on Team {
        teamPromptSettings: meetingSettings(meetingType: teamPrompt) {
          id
        }
      }
    `,
    teamRef
  )

  return null
}
export default NewMeetingSettingsTeamPrompt
