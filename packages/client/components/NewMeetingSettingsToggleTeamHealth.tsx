import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewMeetingSettingsToggleTeamHealth_settings$key} from '~/__generated__/NewMeetingSettingsToggleTeamHealth_settings.graphql'
import type {NewMeetingSettingsToggleTeamHealth_team$key} from '~/__generated__/NewMeetingSettingsToggleTeamHealth_team.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetMeetingSettingsMutation from '../mutations/SetMeetingSettingsMutation'
import isTeamHealthAvailable from '../utils/features/isTeamHealthAvailable'
import NewMeetingSettingsToggleRow from './NewMeetingSettingsToggleRow'
import NewMeetingSettingsUpgradeForTeamHealth from './NewMeetingSettingsUpgradeForTeamHealth'

interface Props {
  teamRef: NewMeetingSettingsToggleTeamHealth_team$key
  settingsRef: NewMeetingSettingsToggleTeamHealth_settings$key
  className?: string
}

const NewMeetingSettingsToggleTeamHealth = (props: Props) => {
  const {teamRef, settingsRef, className} = props

  const team = useFragment(
    graphql`
      fragment NewMeetingSettingsToggleTeamHealth_team on Team {
        ...NewMeetingSettingsUpgradeForTeamHealth_team
        id
        tier
      }
    `,
    teamRef
  )

  // not part of the team fragment as we don't want to specify the meeting type here
  const settings = useFragment(
    graphql`
      fragment NewMeetingSettingsToggleTeamHealth_settings on TeamMeetingSettings {
        id
        phaseTypes
      }
    `,
    settingsRef
  )
  const {tier} = team
  const teamHealthAvailable = isTeamHealthAvailable(tier)

  const {id: settingsId, phaseTypes} = settings
  const hasTeamHealth = phaseTypes.includes('TEAM_HEALTH')
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()
  const toggleTeamHealth = () => {
    if (submitting) return
    submitMutation()
    SetMeetingSettingsMutation(
      atmosphere,
      {teamHealthEnabled: !hasTeamHealth, settingsId},
      {onError, onCompleted}
    )
  }
  if (!teamHealthAvailable) {
    return <NewMeetingSettingsUpgradeForTeamHealth teamRef={team} className={className} />
  }
  return (
    <NewMeetingSettingsToggleRow
      active={hasTeamHealth}
      className={className}
      label={'Include Team Health check'}
      onClick={toggleTeamHealth}
    />
  )
}

export default NewMeetingSettingsToggleTeamHealth
