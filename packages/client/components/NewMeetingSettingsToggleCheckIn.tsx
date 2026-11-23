import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewMeetingSettingsToggleCheckIn_settings$key} from '~/__generated__/NewMeetingSettingsToggleCheckIn_settings.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetMeetingSettingsMutation from '../mutations/SetMeetingSettingsMutation'
import NewMeetingSettingsToggleRow from './NewMeetingSettingsToggleRow'

interface Props {
  settingsRef: NewMeetingSettingsToggleCheckIn_settings$key
  className?: string
}

const NewMeetingSettingsToggleCheckIn = (props: Props) => {
  const {settingsRef, className} = props
  const settings = useFragment(
    graphql`
      fragment NewMeetingSettingsToggleCheckIn_settings on TeamMeetingSettings {
        id
        phaseTypes
      }
    `,
    settingsRef
  )
  const {id: settingsId, phaseTypes} = settings
  const hasCheckIn = phaseTypes.includes('checkin')
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()
  const toggleCheckIn = () => {
    if (submitting) return
    submitMutation()
    SetMeetingSettingsMutation(
      atmosphere,
      {checkinEnabled: !hasCheckIn, settingsId},
      {onError, onCompleted}
    )
  }
  return (
    <NewMeetingSettingsToggleRow
      active={hasCheckIn}
      className={className}
      label='Include Icebreaker'
      tooltip='Open with a warm-up question everyone answers'
      onClick={toggleCheckIn}
    />
  )
}

export default NewMeetingSettingsToggleCheckIn
