import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewMeetingSettingsToggleAnonymity_settings$key} from '~/__generated__/NewMeetingSettingsToggleAnonymity_settings.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetMeetingSettingsMutation from '../mutations/SetMeetingSettingsMutation'
import NewMeetingSettingsToggleRow from './NewMeetingSettingsToggleRow'

interface Props {
  settingsRef: NewMeetingSettingsToggleAnonymity_settings$key
  className?: string
}

const NewMeetingSettingsToggleAnonymity = (props: Props) => {
  const {settingsRef, className} = props

  const settings = useFragment(
    graphql`
      fragment NewMeetingSettingsToggleAnonymity_settings on TeamMeetingSettings {
        id
        ... on RetrospectiveMeetingSettings {
          disableAnonymity
        }
      }
    `,
    settingsRef
  )

  const {id: settingsId, disableAnonymity} = settings
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()
  const toggleAnonymity = () => {
    if (submitting) return
    submitMutation()
    SetMeetingSettingsMutation(
      atmosphere,
      {disableAnonymity: !disableAnonymity, settingsId},
      {onError, onCompleted}
    )
  }
  return (
    <NewMeetingSettingsToggleRow
      active={!disableAnonymity}
      className={className}
      label={'Anonymous reflections'}
      onClick={toggleAnonymity}
    />
  )
}

export default NewMeetingSettingsToggleAnonymity
