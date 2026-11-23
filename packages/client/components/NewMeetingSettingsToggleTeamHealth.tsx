import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewMeetingSettingsToggleTeamHealth_settings$key} from '~/__generated__/NewMeetingSettingsToggleTeamHealth_settings.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useFeatureLaunch from '../hooks/useFeatureLaunch'
import useMutationProps from '../hooks/useMutationProps'
import SetMeetingSettingsMutation from '../mutations/SetMeetingSettingsMutation'
import NewMeetingSettingsToggleRow from './NewMeetingSettingsToggleRow'

interface Props {
  settingsRef: NewMeetingSettingsToggleTeamHealth_settings$key
  className?: string
}

const NewMeetingSettingsToggleTeamHealth = (props: Props) => {
  const {settingsRef, className} = props
  const settings = useFragment(
    graphql`
      fragment NewMeetingSettingsToggleTeamHealth_settings on TeamMeetingSettings {
        id
        phaseTypes
      }
    `,
    settingsRef
  )
  const {id: settingsId, phaseTypes} = settings
  const hasTeamHealthCheck = phaseTypes.includes('TEAM_HEALTH_CHECK')
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()
  const [launch, dismissLaunch] = useFeatureLaunch('teamHealthInRetro')
  const toggleTeamHealth = () => {
    dismissLaunch()
    if (submitting) return
    submitMutation()
    SetMeetingSettingsMutation(
      atmosphere,
      {teamHealthEnabled: !hasTeamHealthCheck, settingsId},
      {onError, onCompleted}
    )
  }
  return (
    <NewMeetingSettingsToggleRow
      active={hasTeamHealthCheck}
      className={className}
      label='Embed Team Health Check'
      tooltip='Answer your team’s open Team Health check in the retro and talk through new results. Answers stay private.'
      launch={launch}
      onClick={toggleTeamHealth}
    />
  )
}

export default NewMeetingSettingsToggleTeamHealth
